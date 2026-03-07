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
const PurchaseReceipt = ({ orderId, date, total, subtotal, shippingCost, discountAmount = 0, currency = '₦', firstName, lastName, phone, email, shippingAddress, items, additionalInfo, deliveryTime }) => {
    const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency;
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null),
        React.createElement(components_1.Preview, null,
            "Congratulations, your order has been confirmed - #",
            orderId),
        React.createElement(components_1.Tailwind, null,
            React.createElement(components_1.Body, { className: "bg-white my-auto mx-auto font-sans py-10" },
                React.createElement(components_1.Container, { className: "mx-auto w-full max-w-[600px] text-slate-900", style: { fontFamily: 'Verdana, sans-serif' } },
                    React.createElement(components_1.Section, { className: "bg-black p-10 mb-8 text-center" },
                        React.createElement(components_1.Heading, { className: "text-white text-[24px] font-normal leading-tight m-0 p-0 uppercase tracking-widest" }, "Congratulations, your order has been confirmed")),
                    React.createElement(components_1.Section, { className: "px-8" },
                        React.createElement(components_1.Text, { className: "text-[16px] font-bold m-0 p-0 mb-2" },
                            "Hi ",
                            firstName || 'Valued Customer'),
                        React.createElement(components_1.Text, { className: "text-[14px] m-0 p-0 mb-8 text-slate-600" }, "We have received your order and are preparing it for shipment."),
                        React.createElement("div", { style: { marginBottom: '20px' } },
                            React.createElement("span", { className: "text-[14px] font-bold uppercase tracking-tight border-b-2 border-black pb-1 inline-block" },
                                "Order ",
                                orderId,
                                " ( ",
                                date,
                                " )")),
                        React.createElement("div", { style: { overflowX: 'auto' } },
                            React.createElement("table", { style: { border: '1px solid black', borderCollapse: 'collapse', width: '100%', marginBottom: '30px', minWidth: '500px' } },
                                React.createElement("thead", null,
                                    React.createElement("tr", null,
                                        React.createElement("td", { style: { border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: 'bold', background: '#f2f2f2' } }, "Product"),
                                        React.createElement("td", { style: { border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', background: '#f2f2f2' } }, "Quantity"),
                                        React.createElement("td", { style: { border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right', background: '#f2f2f2' } }, "Price"))),
                                React.createElement("tbody", null,
                                    items.map((item, index) => (React.createElement("tr", { key: index },
                                        React.createElement("td", { style: { border: '1px solid black', padding: '12px' } },
                                            React.createElement("div", { style: { fontWeight: 'bold', fontSize: '14px' } }, item.name),
                                            item.variantDetails && (React.createElement("div", { style: { fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '2px' } }, item.variantDetails))),
                                        React.createElement("td", { style: { border: '1px solid black', padding: '12px', textAlign: 'center', fontSize: '14px' } }, item.quantity),
                                        React.createElement("td", { style: { border: '1px solid black', padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' } },
                                            symbol,
                                            ((item.price * item.quantity) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))))),
                                    React.createElement("tr", null,
                                        React.createElement("td", { colSpan: 2, style: { border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: '600' } }, "Subtotal"),
                                        React.createElement("td", { style: { border: '1px solid black', padding: '12px', textAlign: 'right', fontWeight: 'bold' } },
                                            symbol,
                                            (subtotal / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))),
                                    React.createElement("tr", null,
                                        React.createElement("td", { colSpan: 2, style: { border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: '600' } }, "Shipping"),
                                        React.createElement("td", { style: { border: '1px solid black', padding: '12px', textAlign: 'right', fontWeight: 'bold' } },
                                            symbol,
                                            (shippingCost / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))),
                                    discountAmount > 0 && (React.createElement("tr", null,
                                        React.createElement("td", { colSpan: 2, style: { border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#dc2626' } }, "Discount"),
                                        React.createElement("td", { style: { border: '1px solid black', padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' } },
                                            "-",
                                            symbol,
                                            (discountAmount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })))),
                                    React.createElement("tr", { style: { background: '#f2f2f2' } },
                                        React.createElement("td", { colSpan: 2, style: { border: '1px solid black', padding: '14px 12px', fontSize: '16px', fontWeight: 'bold' } }, "TOTAL"),
                                        React.createElement("td", { style: { border: '1px solid black', padding: '14px 12px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold' } },
                                            symbol,
                                            (total / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))))))),
                    React.createElement(components_1.Section, { className: "px-8 mt-10" },
                        React.createElement(components_1.Heading, { className: "text-[16px] font-bold mb-4 uppercase border-l-4 border-black pl-3" }, "Shipping Information"),
                        React.createElement("div", { className: "text-[14px] space-y-2 text-slate-700 leading-relaxed" },
                            React.createElement("div", null,
                                React.createElement("strong", null, "Name:"),
                                " ",
                                firstName,
                                " ",
                                lastName),
                            React.createElement("div", null,
                                React.createElement("strong", null, "Phone:"),
                                " ",
                                phone),
                            React.createElement("div", null,
                                React.createElement("strong", null, "Email:"),
                                " ",
                                email),
                            React.createElement("div", null,
                                React.createElement("strong", null, "Address:"),
                                " ",
                                shippingAddress.line1,
                                ", ",
                                shippingAddress.city,
                                ", ",
                                shippingAddress.state,
                                ", ",
                                shippingAddress.country))),
                    React.createElement(components_1.Section, { className: "px-8 mt-12" },
                        React.createElement(components_1.Heading, { className: "text-[16px] font-bold mb-2 uppercase border-l-4 border-black pl-3" }, "Additional Information"),
                        React.createElement("div", { style: { border: '1px solid black', padding: '15px', fontSize: '13px', fontStyle: 'italic', color: '#4b5563' } },
                            additionalInfo && React.createElement("div", { className: "mb-4" }, additionalInfo),
                            items.some(i => i.customization?.embroideryName || i.customization?.specificInstructions) ? (items.filter(i => i.customization?.embroideryName || i.customization?.specificInstructions).map((item, idx) => (React.createElement("div", { key: idx, className: "mb-2" },
                                React.createElement("b", null,
                                    item.name,
                                    ":"),
                                item.customization.embroideryName && (React.createElement("span", { className: "ml-1 text-[11px] uppercase" },
                                    "[Embroidery: ",
                                    item.customization.embroideryName,
                                    "]")),
                                item.customization.specificInstructions && (React.createElement("div", { className: "mt-1 ml-4" },
                                    "\u201C",
                                    item.customization.specificInstructions,
                                    "\u201D")))))) : (!additionalInfo && "No additional information"))),
                    React.createElement(components_1.Section, { className: "px-8 mt-16 text-center" },
                        React.createElement(components_1.Text, { className: "text-[14px]" },
                            "Delivery is expected to take ",
                            deliveryTime || "3-5 business days",
                            "."),
                        React.createElement(components_1.Text, { className: "text-[18px] font-bold mt-4", style: { color: '#480100' } }, "Good luck on taking over the world"),
                        React.createElement(components_1.Link, { className: "bg-black text-white text-[12px] font-bold uppercase tracking-[0.2em] no-underline text-center px-10 py-5 inline-block mt-8", href: `https://wovenkulture.com/orders/${orderId}` }, "View Order"),
                        React.createElement(components_1.Text, { className: "text-slate-400 text-[10px] uppercase mt-12 tracking-widest" }, "Woven Kulture")))))));
};
exports.PurchaseReceipt = PurchaseReceipt;
exports.default = exports.PurchaseReceipt;
//# sourceMappingURL=PurchaseReceipt.js.map