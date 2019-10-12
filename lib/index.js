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
                'us-west-1',
                'us-east-2',
                'eu-central-1',
            ]
        },
        bucket: {
            label: 'Bucket',
            type: 'text'
        },
        quality: {
            label: 'Quality',
            type: 'number',
            min: 10,
            max: 100
        },
        maxWidth: {
            label: 'Max Width',
            type: 'number',
            min: 720,
            max: 3840
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
                console.log(file);
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
                                width: config.maxWidth || width
                            })
                            .jpeg({
                                quality: config.quality || 60,
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