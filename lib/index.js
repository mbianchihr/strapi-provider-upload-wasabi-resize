'use strict';

/**
 * Module dependencies
 */

// Public node modules.
const sharp = require('sharp');
const AWS = require('aws-sdk');

const mimeTypeImage = ["image/png","image/jpeg"];

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
                'us-east-1',
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
                return new Promise((resolve, reject) => {
                    const path = file.path ? `${file.path}/` : '';

                    async function upload(variant, data) {
                        return await S3.upload({
                            Key: `${path}${file.hash}${file.ext}`,
                            Body: data,
                            ACL: 'public-read',
                            ContentType: file.mime,
                        }).promise();
                    }

                    function resizeAndUpload(image, variant, width) {
                        return image.clone()
                            .resize({
                                width: parseInt(config.maxWidth) || width
                            })
                            .jpeg({
                                quality: parseInt(config.quality) || 60,
                                progressive: true,
                                optimiseScans: true
                            })
                            .toBuffer()
                            .then(async data => {
                                const result = await upload(variant, data);

                                file[variant] = result.Location;
                            });
                    }

                    // @TODO: Check that mime type is image and then do the image uploading and resizing
                    if (mimeTypeImage.indexOf(file.mime) > -1) {
                        const image = sharp(Buffer.from(file.buffer, 'binary'));

                        resizeAndUpload(image, 'url', 1920)
                        .then(() => {
                            return resolve()
                        }).catch(err => {
                            return reject(err);
                        });
                    } else {
                        upload('url', file.buffer).then((result) => {
                            
                            file['url'] = result.Location;

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
                            Key: `${path}${file.hash}${file.ext}`
                        }).promise();
                    }

                    const path = file.path ? `${file.path}/` : '';

                    deleteImage(path, file, 'url')
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