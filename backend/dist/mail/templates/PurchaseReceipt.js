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
exports.PurchaseReceipt = void 0;
const components_1 = require("@react-email/components");
const React = __importStar(require("react"));
const PurchaseReceipt = ({ orderId, total, items }) => {
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null),
        React.createElement(components_1.Preview, null,
            "Your receipt for order ",
            orderId),
        React.createElement(components_1.Tailwind, null,
            React.createElement(components_1.Body, { className: "bg-white my-auto mx-auto font-sans" },
                React.createElement(components_1.Container, { className: "border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]" },
                    React.createElement(components_1.Heading, { className: "text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0" }, "Order Confirmation"),
                    React.createElement(components_1.Text, { className: "text-black text-[14px] leading-[24px]" }, "Thank you for your purchase! Here is a summary of your order."),
                    React.createElement(components_1.Section, null,
                        React.createElement(components_1.Text, { className: "text-black text-[14px] leading-[24px] font-bold" },
                            "Order ID: ",
                            orderId)),
                    React.createElement(components_1.Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
                    React.createElement(components_1.Section, null, items.map((item, index) => (React.createElement(components_1.Row, { key: index, className: "mb-4" },
                        React.createElement(components_1.Column, null,
                            React.createElement(components_1.Text, { className: "m-0 text-black text-[14px] font-semibold" }, item.name),
                            React.createElement(components_1.Text, { className: "m-0 text-gray-500 text-[12px]" },
                                "Qty: ",
                                item.quantity)),
                        React.createElement(components_1.Column, { align: "right" },
                            React.createElement(components_1.Text, { className: "m-0 text-black text-[14px]" },
                                "\u20A6",
                                (item.price * item.quantity).toLocaleString())))))),
                    React.createElement(components_1.Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
                    React.createElement(components_1.Section, { align: "right" },
                        React.createElement(components_1.Text, { className: "text-black text-[16px] font-bold leading-[24px]" },
                            "Total: \u20A6",
                            total.toLocaleString())),
                    React.createElement(components_1.Section, { className: "text-center mt-[32px] mb-[32px]" },
                        React.createElement(components_1.Link, { className: "bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3", href: `http://localhost:3000/orders/${orderId}` }, "View Order")))))));
};
exports.PurchaseReceipt = PurchaseReceipt;
exports.default = exports.PurchaseReceipt;
//# sourceMappingURL=PurchaseReceipt.js.map