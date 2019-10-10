'use strict';

/**
 * Module dependencies
 */

// Public node modules.
const sharp = require('sharp');
const AWS = require('aws-sdk');

const trimParam = str => typeof str === "string" ? str.trim() : undefined;

module.exports = {
    provider: 'wasabi-resize',
    name: 'Wasabi upload and resize',
    auth: {
        public: {
            label: 'Access API Token',
            type: 'text'
        },
        private: {
            label: 'Secret Access Token',
            type: 'text'
        },
        region: {
            label: 'Region',
            type: 'enum',
            values: [
                'us-east-1',
                'us-east-2',
                'us-west-1',
                'us-west-2',
                'ca-central-1',
                'ap-south-1',
                'ap-northeast-1',
                'ap-northeast-2',
                'ap-northeast-3',
                'ap-southeast-1',
                'ap-southeast-2',
                'cn-north-1',
                'cn-northwest-1',
                'eu-central-1',
                'eu-north-1',
                'eu-west-1',
                'eu-west-2',
                'eu-west-3',
                'sa-east-1'
            ]
        },
        bucket: {
            label: 'Bucket',
            type: 'text'
        }
    },
    init: (config) => {

        AWS.config.update({
            accessKeyId: trimParam(config.public),
            secretAccessKey: trimParam(config.private),
            region: config.region,
            endpoint: 's3.wasabisys.com'
        });

        const S3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: {
                Bucket: trimParam(config.bucket)
            }
        });

        return {
            upload: (file) => {
                return new Promise((resolve, reject) => {

                    function upload(variant) {
                        return await S3.upload({
                            Key: `${path}${variant}_${file.hash}.jpg`,
                            Body: data,
                            ACL: 'public-read',
                            ContentType: file.mime,
                        }).promise();
                    }

                    function resizeAndUpload(image, variant, width) {
                        return image.clone()
                            .resize({
                                width: width
                            })
                            .jpeg({
                                quality: 60,
                                progressive: true,
                                optimiseScans: true
                            })
                            .toBuffer()
                            .then(async data => {
                                const result = await upload(variant);

                                file[variant] = result.Location;
                            });
                    }

                    // @TODO: Check that mime type is image and then do the image uploading and resizing
                    if (file.mime) {
                        const path = file.path ? `${file.path}/` : '';
                        const image = sharp(new Buffer(file.buffer, 'binary'));

                        resizeAndUpload(image, 'url', 1920).then(() => {
                            return resizeAndUpload(image, 'thumb', 300);
                        }).then(() => {
                            return resolve()
                        }).catch(err => {
                            return reject(err);
                        });
                    } else {
                        upload('url').then(() => {
                            return resolve()
                        }).catch(err => {
                            return reject(err);
                        });
                    }
                });
            },
            delete: (file) => {
                return new Promise((resolve, reject) => {

                    async function deleteImage(path, file, variant) {
                        return await S3.deleteObject({
                            Key: `${path}${variant}_${file.hash}.jpg`
                        }).promise();
                    }

                    const path = file.path ? `${file.path}/` : '';

                    deleteImage(path, file, 'url')
                        .then(() => {
                            return deleteImage(path, file, 'thumb');
                        })
                        .then(() => {
                            return resolve();
                        })
                        .catch(err => {
                            return reject(err);
                        });
                });
            }
        };
    }
};