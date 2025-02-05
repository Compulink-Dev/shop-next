import Image from "next/image";
import { PaynowPayment } from "paynow-react";
import React, { useState } from "react";

type Item = {
  title: string;
  amount: number;
  quantity: number;
  image?: string;
};

const transformItems = (items: Item[]) => {
  return items.map((item) => ({
    name: item.title,
    price: item.amount, // Rename `amount` to `price`
    qty: item.quantity,
    image: item.image,
  }));
};

const PayNowCheckout = ({ items }: { items: Item[] }) => {
  console.log("Items Paynow : ", items);

  // payment modal state
  const [isOpen, setIsOpen] = React.useState(false);

  // toggle modal state. Useful for mobile payments
  const onCloseHandler = (data: any) => {
    // Do something with the data and the close the modal
    console.log(data);
    setIsOpen(false);
  };

  return (
    <div>
      {isOpen && (
        <PaynowPayment
          //@ts-ignore
          items={transformItems(items)}
          label="Compulink Store"
          paymentMode="mobile"
          isOpen={isOpen}
          onClose={onCloseHandler}
        />
      )}
      {/* You can add a button or some other way to trigger the payment modal */}
      {!isOpen && (
        <div className="w-full items-center justify-center">
          <button className="" onClick={() => setIsOpen(true)}>
            <Image
              src="https://www.paynow.co.zw/Content/buttons/medium_buttons/button_add-to-cart_medium.png"
              alt="paynow"
              width={80}
              height={80}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default PayNowCheckout;
