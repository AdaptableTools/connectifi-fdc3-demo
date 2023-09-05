
## Introduction

This demo app illustrates the some AdapTable FDC3 2.0 featues using the [Connectifi Sandbox](https://www.connectifi.co/) as the desktop agent.

AdapTable provides comprehensive [FDC3 functionality](https://docs.adaptabletools.com/guide/handbook-fdc3) including ability to raise and listen to Intents and broadcast and listen to Context.

It requires AdapTable Version 16.0.3 and higher (and AG Grid 30.0 and higher).

## The Demo

The app leverages the Connectifi Sandbox to show how to use the FDC3 capabilities in AdapTable to interop with other applications it widgets.

> The data in the app is meaningless **dummy data**; only the Tickers are real.

The app primarily uses the Instrument Context to manage intents and broadcasts, but all FDC3 context types are available out of the box in AdapTable.

In the app users are able **

## AdapTable FDC3 

Using FDC3 in AdapTable is a 2-step process:

1. FDC3 Mappings are defined - essentially creating context using DataGrid fields and columns
2. Intents are Raised (and listened to) and Contexts are Broadcast (and listened to) using these Mappings.

## The Tech Bits

You have to provide the AdapTable and AG Grid licenses as environment variables (in `.env` file or in your CI/CD pipeline)
- VITE_ADAPTABLE_LICENSE_KEY
- VITE_AG_GRID_LICENSE_KEY

### Installing

> This project uses [node](http://nodejs.org) and a package manager ([npm](https://npmjs.com), [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)).

```sh
$ cd path-to-your-project
$ npm install

# pnpm install
# yarn install
```
### Usage

To run:

```sh
$ npm run dev

# pnpm run dev
# yarn run dev
```


## Licences

An [AdapTable Licence](https://docs.adaptabletools.com/guide/licensing) provides access to all product features as well as quarterly updates and enhancements through the lifetime of the licence, comprehensive support, and access to all 3rd party libraries.

Licences can be purchased individually, for a team, for an organisation or for integration into software for onward sale.

We can make a Trial Licence available for a short period of time to allow you to try out AdapTable for yourself.

Please contact [`sales@adaptabletools.com`](mailto:sales@adaptabletools.com) for more information.

## Help

Developers can learn how to access AdapTable programmatically at [AdapTable Documentation](https://docs.adaptabletools.com).  

Here you can see a large number of AdapTable demos each showing a different feature, function or option in AdapTable.

## Demo

To see AdapTable in action visit our [Demo Site](https://www.adaptabletools.com/demos) which contains a few larger demos.

## More Information

General information about Adaptable Tools is available at our [Website](http://www.adaptabletools.com) 
