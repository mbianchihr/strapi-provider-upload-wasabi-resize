# strapi-provider-upload-wasabi-resize


// WARNING: Still HEAVYILY WIP, use at your own risk!

Wasabi upload and resizeing with image opitmization in Strapi.

```
npm i strapi-provider-upload-wasabi-resize

OR

yarn add strapi-provider-upload-wasabi-resize
```

## Usage

### Pre usage requirments
Make sure `url` and `thumb` atributes exist in your `File.settings.json`

> extensions/uploads/models/File.settings.json

### Using and Configuring
1. Go to Strapi Admin panel
2. Go to Plugins
3. Go to Files and Settings
4. Select `Wasabi upload and resize`

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


### Credits
Based on provider [strapi-provider-upload-aws-s3-resize](https://www.npmjs.com/package/strapi-provider-upload-aws-s3-resize), image resizing usign [Sharp](https://github.com/lovell/sharp).

## Resources

- [MIT License](LICENSE.md)




## Links

- [Strapi website](http://strapi.io/)
- [Strapi community on Slack](http://slack.strapi.io)
- [Strapi news on Twitter](https://twitter.com/strapijs)
