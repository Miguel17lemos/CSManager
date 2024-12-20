const pullCommand = require('./pull')
const pushCommand = require('./push')
const submitCommand = require('./submit')
const checkConfiguration = require('./checkConfiguration')
const configuration = require('./configuration')

module.exports = {
    pullCommand,
    pushCommand,
    submitCommand,
    checkConfiguration,
    configuration
}