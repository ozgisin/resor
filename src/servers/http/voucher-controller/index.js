const status = require('http-status');
const {generate, charset} = require('voucher-code-generator');

class VoucherController {
  constructor({Voucher}, generateVoucher = generate) {
    this.Voucher = Voucher;
    this.generateVoucher = generateVoucher;
  }

  async findAll(req, res) {
    const vouchers = await this.Voucher.find({});
    res.status(status.OK).json(vouchers);
  }

  async create(req, res) {
    const {
      body: {discount},
    } = req;

    const code = this.generateVoucher({
      length: 8,
      count: 1,
      charset: charset('alphanumeric'),
    });

    const voucher = await this.Voucher.create({
      discount,
      code: code[0],
    });

    res.status(status.CREATED).json(voucher);
  }
}

module.exports = VoucherController;
