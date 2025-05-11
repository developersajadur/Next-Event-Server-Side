"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderInvoicePDF = void 0;
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
const pdfkit_1 = __importDefault(require("pdfkit"));
const axios_1 = __importDefault(require("axios"));
const generateOrderInvoicePDF = (payment) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const doc = new pdfkit_1.default({ margin: 50 });
            const buffers = [];
            //@ts-ignore
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));
            // HEADER
            doc.fontSize(24).font('Helvetica-Bold').fillColor('#0f172a').text('Next Event', { align: 'center' });
            doc.fontSize(10).fillColor('#334155').text('Secure Event Platform by Next Event Team', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(14).fillColor('#1d4ed8').text('Payment Invoice', { align: 'center' });
            doc.moveDown();
            // BANNER IMAGE (if available)
            if ((_a = payment.event) === null || _a === void 0 ? void 0 : _a.bannerImage) {
                try {
                    const imageResponse = yield axios_1.default.get(payment.event.bannerImage, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(imageResponse.data, 'base64');
                    doc.image(imageBuffer, {
                        width: 400,
                        height: 250,
                        align: 'center',
                        valign: 'center',
                    });
                    doc.moveDown();
                }
                catch (e) {
                    console.warn('Banner image could not be loaded.');
                }
            }
            // METADATA
            doc.fontSize(11).fillColor('#000000').text(`Invoice ID: ${payment.id}`);
            doc.text(`Issued On: ${new Date((_b = payment.createdAt) !== null && _b !== void 0 ? _b : new Date()).toLocaleDateString()}`);
            doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
            doc.moveDown();
            // USER DETAILS
            doc.fontSize(11).fillColor('#000000').text(`User Name: ${(_c = payment.user) === null || _c === void 0 ? void 0 : _c.name}`);
            doc.text(`User Email: ${(_d = payment.user) === null || _d === void 0 ? void 0 : _d.email}`);
            doc.moveDown();
            // EVENT DETAILS
            doc.fontSize(11).fillColor('#000000').text(`Event Title: ${(_e = payment.event) === null || _e === void 0 ? void 0 : _e.title}`);
            doc.text(`Venue: ${((_f = payment.event) === null || _f === void 0 ? void 0 : _f.venue) || 'N/A'}`);
            doc.text(`Event Description:`);
            doc.font('Helvetica-Oblique').text(`${((_g = payment.event) === null || _g === void 0 ? void 0 : _g.description) || 'N/A'}`, { align: 'justify' });
            doc.moveDown();
            // PAYMENT DETAILS
            doc.fontSize(11).fillColor('#000000').text(`Payment Method: ${payment.method}`);
            doc.text(`Payment Status: ${payment.status}`);
            doc.moveDown();
            // AMOUNT TABLE
            const tableY = doc.y;
            doc.font('Helvetica-Bold').fillColor('#1d4ed8').fontSize(11);
            doc.text('Description', 50, tableY);
            doc.text('Amount (BDT)', 400, tableY, { width: 100, align: 'right' });
            doc.moveTo(50, tableY + 15).lineTo(550, tableY + 15).stroke();
            const rowY = tableY + 20;
            doc.font('Helvetica').fillColor('#000000').fontSize(11);
            // Ensure payment.amount is a valid number
            // let amount: number;
            // if (typeof payment.amount === 'string') {
            //   amount = parseFloat(payment.amount);
            // } else if (typeof payment.amount === 'number') {
            //   amount = payment.amount;
            // } else {
            //   throw new Error('Invalid payment amount: must be a number or numeric string');
            // }
            doc.text('Total Payment', 50, rowY);
            doc.text(`${payment.amount.toFixed(2)} /-`, 400, rowY, { width: 100, align: 'right' });
            // FOOTER
            doc.moveDown(3);
            doc.fontSize(9).fillColor('#334155').text('Thank you for your payment with Next Event!');
            doc.text('Please keep this invoice for your records.', { align: 'center' });
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    }));
});
exports.generateOrderInvoicePDF = generateOrderInvoicePDF;
