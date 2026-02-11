"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInviteEmail = void 0;
const components_1 = require("@react-email/components");
const React = __importStar(require("react"));
const AdminInviteEmail = ({ inviteUrl, inviterName }) => {
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null),
        React.createElement(components_1.Preview, null, "You have been invited to join Woven Kulture Admin"),
        React.createElement(components_1.Tailwind, null,
            React.createElement(components_1.Body, { className: "bg-white my-auto mx-auto font-sans" },
                React.createElement(components_1.Container, { className: "border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]" },
                    React.createElement(components_1.Section, { className: "mt-[32px]" },
                        React.createElement(components_1.Heading, { className: "text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0" },
                            "Join ",
                            React.createElement("strong", null, "Woven Kulture"),
                            " Admin")),
                    React.createElement(components_1.Text, { className: "text-black text-[14px] leading-[24px]" }, "Hello,"),
                    React.createElement(components_1.Text, { className: "text-black text-[14px] leading-[24px]" },
                        React.createElement("strong", null, inviterName),
                        " has invited you to join the Woven Kulture administration team."),
                    React.createElement(components_1.Section, { className: "text-center mt-[32px] mb-[32px]" },
                        React.createElement(components_1.Link, { className: "bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3", href: inviteUrl }, "Accept Invitation")),
                    React.createElement(components_1.Text, { className: "text-black text-[14px] leading-[24px]" },
                        "or copy and paste this URL into your browser:",
                        " ",
                        React.createElement(components_1.Link, { href: inviteUrl, className: "text-blue-600 no-underline" }, inviteUrl)),
                    React.createElement(components_1.Text, { className: "text-gray-500 text-[12px] mt-4" }, "If you were not expecting this invitation, you can ignore this email."))))));
};
exports.AdminInviteEmail = AdminInviteEmail;
exports.default = exports.AdminInviteEmail;
//# sourceMappingURL=AdminInviteEmail.js.map