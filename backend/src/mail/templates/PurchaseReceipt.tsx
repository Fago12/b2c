import {
    Body,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface PurchaseReceiptProps {
    orderId: string;
    date: string;
    total: number;
    subtotal: number;
    shippingCost: number;
    discountAmount?: number;
    currency: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    shippingAddress: {
        line1: string;
        city: string;
        state: string;
        country: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number; // Unit price final
        image?: string;
        variantDetails?: string;
        customization?: any;
    }>;
    additionalInfo?: string;
    deliveryTime?: string;
}

export const PurchaseReceipt = ({
    orderId,
    date,
    total,
    subtotal,
    shippingCost,
    discountAmount = 0,
    currency = '₦',
    firstName,
    lastName,
    phone,
    email,
    shippingAddress,
    items,
    additionalInfo,
    deliveryTime
}: PurchaseReceiptProps) => {
    const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency;

    return (
        <Html>
            <Head />
            <Preview>Congratulations, your order has been confirmed - #{orderId}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans py-10">
                    <Container className="mx-auto w-full max-w-[600px] text-slate-900" style={{ fontFamily: 'Verdana, sans-serif' }}>
                        {/* High-contrast Black Header consistent with root source */}
                        <Section className="bg-black p-10 mb-8 text-center">
                            <Heading className="text-white text-[24px] font-normal leading-tight m-0 p-0 uppercase tracking-widest">
                                Congratulations, your order has been confirmed
                            </Heading>
                        </Section>

                        <Section className="px-8">
                            <Text className="text-[16px] font-bold m-0 p-0 mb-2">
                                Hi {firstName || 'Valued Customer'}
                            </Text>
                            <Text className="text-[14px] m-0 p-0 mb-8 text-slate-600">
                                We have received your order and are preparing it for shipment.
                            </Text>

                            <div style={{ marginBottom: '20px' }}>
                                <span className="text-[14px] font-bold uppercase tracking-tight border-b-2 border-black pb-1 inline-block">
                                    Order {orderId} ( {date} )
                                </span>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ border: '1px solid black', borderCollapse: 'collapse', width: '100%', marginBottom: '30px', minWidth: '500px' }}>
                                    <thead>
                                        <tr>
                                            <td style={{ border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: 'bold', background: '#f2f2f2' }}>Product</td>
                                            <td style={{ border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', background: '#f2f2f2' }}>Quantity</td>
                                            <td style={{ border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right', background: '#f2f2f2' }}>Price</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ border: '1px solid black', padding: '12px' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
                                                    {item.variantDetails && (
                                                        <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>{item.variantDetails}</div>
                                                    )}
                                                </td>
                                                <td style={{ border: '1px solid black', padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                                                    {item.quantity}
                                                </td>
                                                <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                                                    {symbol}{((item.price * item.quantity) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={2} style={{ border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Subtotal</td>
                                            <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                                                {symbol}{(subtotal / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} style={{ border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Shipping</td>
                                            <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                                                {symbol}{(shippingCost / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                        {discountAmount > 0 && (
                                            <tr>
                                                <td colSpan={2} style={{ border: '1px solid black', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>Discount</td>
                                                <td style={{ border: '1px solid black', padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>
                                                    -{symbol}{(discountAmount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        )}
                                        <tr style={{ background: '#f2f2f2' }}>
                                            <td colSpan={2} style={{ border: '1px solid black', padding: '14px 12px', fontSize: '16px', fontWeight: 'bold' }}>TOTAL</td>
                                            <td style={{ border: '1px solid black', padding: '14px 12px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>
                                                {symbol}{(total / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Section>

                        <Section className="px-8 mt-10">
                            <Heading className="text-[16px] font-bold mb-4 uppercase border-l-4 border-black pl-3">Shipping Information</Heading>
                            <div className="text-[14px] space-y-2 text-slate-700 leading-relaxed">
                                <div><strong>Name:</strong> {firstName} {lastName}</div>
                                <div><strong>Phone:</strong> {phone}</div>
                                <div><strong>Email:</strong> {email}</div>
                                <div><strong>Address:</strong> {shippingAddress.line1}, {shippingAddress.city}, {shippingAddress.state}, {shippingAddress.country}</div>
                            </div>
                        </Section>

                        <Section className="px-8 mt-12">
                            <Heading className="text-[16px] font-bold mb-2 uppercase border-l-4 border-black pl-3">Additional Information</Heading>
                            <div style={{ border: '1px solid black', padding: '15px', fontSize: '13px', fontStyle: 'italic', color: '#4b5563' }}>
                                {additionalInfo && <div className="mb-4">{additionalInfo}</div>}
                                {items.some(i => i.customization?.embroideryName || i.customization?.specificInstructions) ? (
                                    items.filter(i => i.customization?.embroideryName || i.customization?.specificInstructions).map((item, idx) => (
                                        <div key={idx} className="mb-2">
                                            <b>{item.name}:</b>
                                            {item.customization.embroideryName && (
                                                <span className="ml-1 text-[11px] uppercase">[Embroidery: {item.customization.embroideryName}]</span>
                                            )}
                                            {item.customization.specificInstructions && (
                                                <div className="mt-1 ml-4">&ldquo;{item.customization.specificInstructions}&rdquo;</div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    !additionalInfo && "No additional information"
                                )}
                            </div>
                        </Section>

                        <Section className="px-8 mt-16 text-center">
                            <Text className="text-[14px]">
                                Delivery is expected to take {deliveryTime || "3-5 business days"}.
                            </Text>
                            <Text className="text-[18px] font-bold mt-4" style={{ color: '#480100' }}>
                                Good luck on taking over the world
                            </Text>

                            <Link
                                className="bg-black text-white text-[12px] font-bold uppercase tracking-[0.2em] no-underline text-center px-10 py-5 inline-block mt-8"
                                href={`https://wovenkulture.com/orders/${orderId}`}
                            >
                                View Order
                            </Link>

                            <Text className="text-slate-400 text-[10px] uppercase mt-12 tracking-widest">
                                Woven Kulture
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default PurchaseReceipt;
