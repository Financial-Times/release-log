
Change Request
==============

Automate opening/closing of change requests for FT applications.

[![Build status](https://img.shields.io/circleci/project/Financial-Times/change-request.svg)][ci]
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)][license]

```sh
change-request \
  --owner-email "you@ft.com" \
  --summary "Hello World" \
  --description "This is a description" \
  --service "my service" \
  --api-key "xxxxxx"
```


Table Of Contents
-----------------

  * [Requirements](#requirements)
  * [Install](#install)
  * [Usage](#usage)
  * [Testing](#testing)
  * [Deployment](#deployment)
  * [License](#license)


Requirements
------------

Running the change request tool requires [Node.js] 4.x and [npm].


Install
-------

```sh
npm install -g @financial-times/change-request
```

Usage
-----

```
Usage: change-request [options]

  Options:

    -h, --help                            output usage information
    -V, --version                         output the version number
    -a, --api-key <key>                   the API key to use when accessing the CR API
    -o, --owner-email <email>             the change request owner email address
    -s, --summary <summary>               a short summary of the change
    -d, --description <description>       a short description of the change
    -r, --reason <reason>                 the reason for the change. Default: "Deployment"
    -c, --open-category <category>        the category for opening the change request. One of "Major", "Minor", "Significant". Default: "Minor"
    -C, --close-category <category>       the category for closing the change request. One of "Implemented", "Partially Implemented", "Rejected", "Rolled back", "Cancelled". Default: "Implemented"
    -R, --risk-profile <risk-profile>     the risk profile for the change request. One of "Low", "Medium", "High". Default: "Low"
    -e, --environment <environment>       the environment the change request applies to. One of "Production", "Test", "Development", "Disaster Recovery". Default: "Test"
    -O, --outage                          whether there will be an outage. Default: false
    -S, --service <service>               the service that the change request applies to
    -n, --notify-channel <slack-channel>  the slack channel to notify of the change request
```


Testing
-------

To run tests on your machine you'll need to install [Node.js] and run `make install`. Then you can run the following commands:

```sh
make test              # run all the tests
make test-unit         # run the unit tests
```

You can run the unit tests with coverage reporting, which expects 90% coverage or more:

```sh
make test-unit-coverage verify-coverage
```

The code will also need to pass linting on CI, you can run the linter locally with:

```sh
make verify
```

We run the tests and linter on CI, you can view [results on CircleCI][ci]. `make test` and `make lint` must pass before we merge a pull request.


Deployment
----------

New versions of the module are published automatically by CI when a new tag is created matching the pattern `/v.*/`.


License
-------

The Financial Times has published this software under the [MIT license][license].



[ci]: https://circleci.com/gh/Financial-Times/change-request
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[semver]: http://semver.org/
