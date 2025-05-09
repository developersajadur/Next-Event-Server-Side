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
exports.EmailHelper = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const sendEmail = (email, html, subject, attachment) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: config_1.default.emailSender.email,
                pass: config_1.default.emailSender.app_password,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        const mailOptions = {
            from: '"Next-Event" <support@nextevent.com>',
            to: email,
            subject,
            html,
            attachments: attachment
                ? [
                    {
                        filename: attachment.filename,
                        content: attachment.content,
                        encoding: attachment.encoding,
                    },
                ]
                : [],
        };
        const info = yield transporter.sendMail(mailOptions);
        // console.log('Email sent:', info.messageId);
        return info;
    }
    catch (_a) {
        throw new Error('Failed to send email');
    }
});
const createEmailContent = (data, templateType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templatePath = path_1.default.join(process.cwd(), 'src', 'templates', `${templateType}.template.hbs`);
        const content = yield promises_1.default.readFile(templatePath, 'utf8');
        const compiled = handlebars_1.default.compile(content);
        return compiled(data);
    }
    catch (_a) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Failed to create email content');
    }
});
exports.EmailHelper = {
    sendEmail,
    createEmailContent,
};
