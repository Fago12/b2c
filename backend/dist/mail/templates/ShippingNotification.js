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
exports.ShippingNotification = void 0;
const components_1 = require("@react-email/components");
const React = __importStar(require("react"));
const ShippingNotification = ({ orderId, carrier, trackingNumber, trackingUrl, items }) => {
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null),
        React.createElement(components_1.Preview, null,
            "Your order ",
            orderId,
            " has been shipped!"),
        React.createElement(components_1.Tailwind, null,
            React.createElement(components_1.Body, { className: "bg-white my-auto mx-auto font-sans" },
                React.createElement(components_1.Container, { className: "border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]" },
                    React.createElement(components_1.Heading, { className: "text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0" }, "Order Shipped! \uD83D\uDE9A"),
                    React.createElement(components_1.Text, { className: "text-black text-[14px] leading-[24px]" }, "Great news! Your order has been shipped and is on its way to you."),
                    React.createElement(components_1.Section, { className: "bg-[#f9f9f9] p-[16px] rounded mb-[20px]" },
                        React.createElement(components_1.Text, { className: "m-0 text-black text-[14px]" },
                            React.createElement("strong", null, "Carrier:"),
                            " ",
                            carrier),
                        React.createElement(components_1.Text, { className: "m-0 text-black text-[14px]" },
                            React.createElement("strong", null, "Tracking Number:"),
                            " ",
                            trackingNumber)),
                    React.createElement(components_1.Section, { className: "text-center mb-[32px]" },
                        React.createElement(components_1.Link, { className: "bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3", href: trackingUrl }, "Track Your Order")),
                    React.createElement(components_1.Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
                    React.createElement(components_1.Heading, { className: "text-black text-[18px] font-semibold mb-[10px]" }, "Items in this shipment"),
                    React.createElement(components_1.Section, null, items.map((item, index) => (React.createElement(components_1.Row, { key: index, className: "mb-2" },
                        React.createElement(components_1.Column, null,
                            React.createElement(components_1.Text, { className: "m-0 text-black text-[14px]" },
                                item.name,
                                " x ",
                                item.quantity)))))),
                    React.createElement(components_1.Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
                    React.createElement(components_1.Text, { className: "text-gray-500 text-[12px] text-center" }, "If you have any questions, please reply to this email or visit our website."))))));
};
exports.ShippingNotification = ShippingNotification;
exports.default = exports.ShippingNotification;
//# sourceMappingURL=ShippingNotification.js.map