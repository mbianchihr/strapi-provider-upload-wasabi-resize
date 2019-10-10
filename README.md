# strapi-provider-upload-aws-s3-resize

Add image resizing to strapi S3 upload
in your strapi admin, change Plugins -> Files upload settings to AWS S3 upload resize.

```
npm i strapi-provider-upload-aws-s3-resize

OR

yarn add strapi-provider-upload-aws-s3-resize
```

node resizing library 
https://github.com/lovell/sharp


make sure the attributes 'url' and 'thumb exists in your in 
> extensions/uploads/models/File.settings.json

#### Example File.settings.json:
```
{
  "connection": "default",
  "info": {
    "name": "file",
    "description": ""
  },
  "options": {
    "timestamps": true
  },
  "attributes": {
    "name": {
      "type": "string",
      "configurable": false,
      "required": true
    },``
    "hash": {
      "type": "string",
      "configurable": false,
      "required": true
    },
    "sha256": {
      "type": "string",
      "configurable": false
    },
    "ext": {
      "type": "string",
      "configurable": false
    },
    "mime": {
      "type": "string",
      "configurable": false,
      "required": true
    },
    "size": {
      "type": "string",
      "configurable": false,
      "required": true
    },
    "url": {
      "type": "string",
      "configurable": false,
      "required": true
    },
    "thumb": {
      "type": "string",
      "configurable": false,
      "required": false
    },
    "provider": {
      "type": "string",
      "configurable": false,
      "required": true
    },
    "public_id": {
      "type": "string",
      "configurable": false
    },
    "related": {
      "collection": "*",
      "filter": "field",
      "configurable": false
    }
  }
}

```


## Resources

- [MIT License](LICENSE.md)

## Links

- [Strapi website](http://strapi.io/)
- [Strapi community on Slack](http://slack.strapi.io)
- [Strapi news on Twitter](https://twitter.com/strapijs)
