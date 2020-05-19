/*
    Copyright 2020 The caver-js Authors
    This file is part of the caver-js library.

    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

const RLP = require('eth-lib/lib/rlp')
const Bytes = require('eth-lib/lib/bytes')
const _ = require('lodash')
const AbstractFeeDelegatedTransaction = require('../abstractFeeDelegatedTransaction')
const { TX_TYPE_STRING, TX_TYPE_TAG } = require('../../transactionHelper/transactionHelper')
const utils = require('../../../../caver-utils')

function _decode(rlpEncoded) {
    rlpEncoded = utils.addHexPrefix(rlpEncoded)
    if (!rlpEncoded.startsWith(TX_TYPE_TAG.TxTypeFeeDelegatedValueTransfer))
        throw new Error(
            `Cannot decode to FeeDelegatedValueTransfer. The prefix must be ${TX_TYPE_TAG.TxTypeFeeDelegatedValueTransfer}: ${rlpEncoded}`
        )

    const typeDettached = `0x${rlpEncoded.slice(4)}`
    const [nonce, gasPrice, gas, to, value, from, signatures, feePayer, feePayerSignatures] = RLP.decode(typeDettached)
    return {
        nonce: utils.trimLeadingZero(nonce),
        gasPrice: utils.trimLeadingZero(gasPrice),
        gas: utils.trimLeadingZero(gas),
        to,
        value: utils.trimLeadingZero(value),
        from,
        signatures,
        feePayer,
        feePayerSignatures,
    }
}

/**
 * Represents a fee delegated value transfer transaction.
 * Please refer to https://docs.klaytn.com/klaytn/design/transactions/fee-delegation#txtypefeedelegatedvaluetransfer to see more detail.
 * @class
 */
class FeeDelegatedValueTransfer extends AbstractFeeDelegatedTransaction {
    /**
     * decodes the RLP-encoded string and returns a FeeDelegatedValueTransfer transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded fee delegated value transfer transaction.
     * @return {FeeDelegatedValueTransfer}
     */
    static decode(rlpEncoded) {
        return new FeeDelegatedValueTransfer(_decode(rlpEncoded))
    }

    /**
     * Creates a fee delegated value transfer transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a FeeDelegatedValueTransfer transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `nonce`, `gas`, `gasPrice`, `signatures`, `feePayer`, `feePayerSignatures` and `chainId`.
     */
    constructor(createTxObj) {
        if (_.isString(createTxObj)) createTxObj = _decode(createTxObj)
        super(TX_TYPE_STRING.TxTypeFeeDelegatedValueTransfer, createTxObj)
        this.from = createTxObj.from
        this.to = createTxObj.to
        this.value = createTxObj.value
    }

    /**
     * @type {string}
     */
    get from() {
        return this._from
    }

    set from(address) {
        if (!utils.isAddress(address)) throw new Error(`Invalid address of from: ${address}`)
        this._from = address.toLowerCase()
    }

    /**
     * @type {string}
     */
    get to() {
        return this._to
    }

    set to(address) {
        if (!utils.isAddress(address)) throw new Error(`Invalid address of to: ${address}`)
        this._to = address.toLowerCase()
    }

    /**
     * @type {string}
     */
    get value() {
        return this._value
    }

    set value(val) {
        this._value = utils.numberToHex(val)
    }

    /**
     * Returns the RLP-encoded string of this transaction (i.e., rawTransaction).
     * @return {string}
     */
    getRLPEncoding() {
        this.validateOptionalValues()

        return (
            TX_TYPE_TAG.TxTypeFeeDelegatedValueTransfer +
            RLP.encode([
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.gasPrice),
                Bytes.fromNat(this.gas),
                this.to.toLowerCase(),
                Bytes.fromNat(this.value),
                this.from.toLowerCase(),
                this.signatures,
                this.feePayer.toLowerCase(),
                this.feePayerSignatures,
            ]).slice(2)
        )
    }

    /**
     * Returns the RLP-encoded transaction string to make the signature of this transaction.
     * @return {string}
     */
    getCommonRLPEncodingForSignature() {
        this.validateOptionalValues()

        return RLP.encode([
            TX_TYPE_TAG.TxTypeFeeDelegatedValueTransfer,
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.to.toLowerCase(),
            Bytes.fromNat(this.value),
            this.from.toLowerCase(),
        ])
    }
}

module.exports = FeeDelegatedValueTransfer
