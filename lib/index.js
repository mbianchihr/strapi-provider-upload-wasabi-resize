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

                // File
                // { tmpPath:
                //     '/var/folders/8m/s_wf2gbn7211ygzt24f7fwm40000gn/T/upload_d0b83073de8053192e5b2e25e289c709',
                //    name: 'sample_4k_image_16.jpg',
                //    sha256: 'bbQ_mgsHSqtT4sOjORrgcTSfxhBjwC6Gqx4IxhVmz1k',
                //    hash: '1769bd0643034807bfb820b22fb4d25b',
                //    ext: '.jpg',
                //    buffer:
                //     <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff db 00 84 00 0a 07 07 08 07 06 0a 08 08 08 0b 0a 0a 0b 0e 18 10 0e 0d 0d 0e 1d 15 16 11 ... 1394773 more bytes>,
                //    mime: 'image/jpeg',
                //    size: '1394.82',
                //    related:
                //     [ { refId: '2',
                //         ref: 'release',
                //         source: 'content-manager',
                //         field: 'coverArt' } ] }
                return new Promise((resolve, reject) => {
                    const path = file.path ? `${file.path}/` : '';
                    
                    async function upload(variant) {
                        return await S3.upload({
                            Key: `${path}${variant}_${file.hash}${file.ext}`,
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
                                const result = await upload(variant);

                                file[variant] = result.Location;
                            });
                    }

                    // @TODO: Check that mime type is image and then do the image uploading and resizing
                    if (mimeTypeImage.indexOf(file.mime) > -1) {
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
                            Key: `${path}${variant}_${file.hash}${file.ext}`
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