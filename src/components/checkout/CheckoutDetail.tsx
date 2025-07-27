"use client";

import React, { useEffect, useState } from "react";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import Input from "../utilities/Input";
import BrowserIcon from "../utilities/BrowserIcon";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/utils/CartStore";


countries.registerLocale(en);

interface CheckoutDetailProps {
  couponCode: string;
  discountAmount: number;
}

const pakistaniCities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Larkana",
  "Sheikhupura",
  "Rahim Yar Khan",
  "Jhang",
  "Dera Ghazi Khan",
  "Abbottabad",
];

const Dropdown = ({
  options,
  selected,
  setSelected,
  label,
}: {
  options: string[];
  selected: string;
  setSelected: (value: string) => void;
  label: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm mb-1 text-gray-700">{label}</label>
      <div
        className={`border rounded px-4 py-3 text-sm cursor-pointer bg-white transition-all duration-150 ${
          open ? "ring-2 ring-[#1773b0]" : "border-gray-300"
        }`}
        onClick={() => setOpen(!open)}
      >
        {selected || `Select ${label}`}
      </div>
      {open && (
        <div className="absolute z-10 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg w-full text-sm">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer transition-all duration-100 hover:bg-gray-100 ${
                selected === option ? "bg-gray-100 font-medium" : ""
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CheckoutDetail: React.FC<CheckoutDetailProps> = ({
  couponCode,
  discountAmount,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const [countriesList, setCountriesList] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("Pakistan");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const { items, clearCart } = useCartStore();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    phone: "",
    cityInput: "",
    state: "",
    postal: "",
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingApartment: "",
    billingCity: "",
    billingState: "",
    billingPostalCode: "",
    billingCountry: "Pakistan",
  });

  useEffect(() => {
    const countryNames = countries.getNames("en", { select: "official" });
    setCountriesList(Object.values(countryNames));
  }, []);

  const isInternational = selectedCountry !== "Pakistan";
  const hasFilledFields =
    formData.address &&
    (isInternational ? formData.cityInput : selectedCity) &&
    (isInternational ? formData.state : true) &&
    (isInternational ? formData.postal : true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async () => {
    setIsLoading(true);
    try {
      // Basic validation
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.address ||
        !formData.phone
      ) {
        throw new Error("Please fill in all required fields");
      }

      if (
        isInternational &&
        (!formData.cityInput || !formData.state || !formData.postal)
      ) {
        throw new Error("Please fill in all international shipping details");
      }

      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          combinationId: item.combinationId,
          quantity: item.quantity,
          product: item.product,
          discountedAmount: discountAmount,
        })),
        paymentMethod: selectedPayment,
        couponCode: couponCode || undefined,
        shippingAmount:isInternational?14000:150,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          apartment: formData.apartment || undefined,
          city: isInternational ? formData.cityInput : selectedCity,
          state: isInternational ? formData.state : undefined,
          postalCode: isInternational ? formData.postal : undefined,
          country: selectedCountry,
          phone: formData.phone,
          email: session?.user.email,
        },

        billingAddress: useDifferentBilling
          ? {
              firstName: formData.billingFirstName || formData.firstName,
              lastName: formData.billingLastName || formData.lastName,
              address: formData.billingAddress || formData.address,
              apartment:
                formData.billingApartment || formData.apartment || undefined,
              city:
                formData.billingCity ||
                (isInternational ? formData.cityInput : selectedCity),
              state:
                formData.billingState ||
                (isInternational ? formData.state : undefined),
              postalCode:
                formData.billingPostalCode ||
                (isInternational ? formData.postal : undefined),
              country: formData.billingCountry || selectedCountry,
              phone: formData.phone,
            }
          : undefined,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order!");
      }

      if (selectedPayment === "paypal") {
        window.location.href = data.paymentUrl;
      } else {
        clearCart();
        router.push(`/order-confirmation/${data.order.id}`);
      }
    } catch (error) {
      console.error("Order submission error", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to place order. Please try again.");
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg:w-1/2 p-6 space-y-6">
      {/* DELIVERY */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Delivery</h2>

        {!isInternational && (
          <Dropdown
            label="City"
            options={pakistaniCities}
            selected={selectedCity}
            setSelected={setSelectedCity}
          />
        )}

        <div className="mt-4">
          <Dropdown
            label="Country/Region"
            options={countriesList}
            selected={selectedCountry}
            setSelected={setSelectedCountry}
          />
        </div>

        <div className="flex gap-4 mt-4">
          <div className="w-1/2">
            <label className="block text-sm mb-1 text-gray-700">
              First name*
            </label>
            <Input
              type="text"
              name="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1 text-gray-700">
              Last name*
            </label>
            <Input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-1 text-gray-700">Address*</label>
          <Input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-1 text-gray-700">
            Apartment, suite, etc
          </label>
          <Input
            type="text"
            name="apartment"
            placeholder="Apartment, suite, etc. (optional)"
            value={formData.apartment}
            onChange={handleInputChange}
          />
        </div>

        {isInternational && (
          <div className="flex gap-4 mt-4">
            <div className="w-1/3">
              <label className="block text-sm mb-1 text-gray-700">City*</label>
              <Input
                type="text"
                name="cityInput"
                placeholder="City"
                value={formData.cityInput}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm mb-1 text-gray-700">
                State / Territory*
              </label>
              <Input
                type="text"
                name="state"
                placeholder="State / Territory"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm mb-1 text-gray-700">
                Postal Code*
              </label>
              <Input
                type="text"
                name="postal"
                placeholder="Postal Code"
                value={formData.postal}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm mb-1 text-gray-700">Phone*</label>
          <Input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      {/* SHIPPING METHOD */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
        <div
          className={`flex justify-between items-center rounded px-4 py-3 ${
            isInternational
              ? "bg-gray-100 text-gray-800"
              : "border border-[#1773b0] bg-blue-50"
          }`}
        >
          <span className="text-sm">
            {isInternational
              ? hasFilledFields
                ? "DHL Express"
                : "Enter your shipping address to view available shipping methods"
              : "Standard"}
          </span>
          <span className="text-sm font-medium">
            {isInternational
              ? hasFilledFields
                ? "Rs 14,000.00"
                : ""
              : "Rs 150.00"}
          </span>
        </div>
      </div>

      {/* PAYMENT */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payment</h2>
        <p className="text-sm text-gray-500 mb-4">
          All transactions are secure and encrypted.
        </p>

        {[
          ...(selectedCountry === "Pakistan"
            ? [{ label: "Cash on Delivery (COD)", value: "cod" }]
            : []),
          { label: "PayPal", value: "paypal" },
        ].map((option) => (
          <div key={option.value}>
            <div
              className={`flex items-center gap-3 cursor-pointer border rounded px-4 py-3 mb-3 text-sm ${
                selectedPayment === option.value
                  ? "border-[#1773b0] bg-blue-50"
                  : "border-gray-300"
              }`}
              onClick={() => setSelectedPayment(option.value)}
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedPayment === option.value
                    ? "border-[#1773b0] bg-blue-50"
                    : "border-gray-400"
                }`}
              >
                {selectedPayment === option.value && (
                  <div className="w-2.5 h-2.5 bg-[#1773b0] rounded-full"></div>
                )}
              </div>
              <span>{option.label}</span>
            </div>

            {option.value === "paypal" && selectedPayment === "paypal" && (
              <div className="flex flex-col justify-center items-center w-full min-h-[12rem] bg-gray-100 rounded p-6">
                <BrowserIcon />
                <p className="text-sm text-center max-w-sm my-4">
                  After clicking &quot;Pay now&quot;, you will be redirected to
                  PayPal to complete your purchase securely.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BILLING ADDRESS */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
        <div
          className={`flex items-center gap-3 cursor-pointer border rounded px-4 py-3 mb-3 text-sm ${
            !useDifferentBilling
              ? "border-[#1773b0] bg-blue-50"
              : "border-gray-300"
          }`}
          onClick={() => setUseDifferentBilling(false)}
        >
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              !useDifferentBilling ? "border-[#1773b0]" : "border-gray-400"
            }`}
          >
            {!useDifferentBilling && (
              <div className="w-2.5 h-2.5 bg-[#1773b0] rounded-full"></div>
            )}
          </div>
          <span>Same as shipping address</span>
        </div>
        <div
          className={`flex items-center gap-3 cursor-pointer border rounded px-4 py-3 mb-2 text-sm ${
            useDifferentBilling
              ? "border-[#1773b0] bg-blue-50"
              : "border-gray-300"
          }`}
          onClick={() => setUseDifferentBilling(true)}
        >
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              useDifferentBilling
                ? "border-[#1773b0] bg-blue-50"
                : "border-gray-400"
            }`}
          >
            {useDifferentBilling && (
              <div className="w-2.5 h-2.5 bg-[#1773b0] rounded-full"></div>
            )}
          </div>
          <span>Use a different billing address</span>
        </div>

        {useDifferentBilling && (
          <div className="space-y-4 mt-4">
            <Dropdown
              label="Country/Region"
              options={countriesList}
              selected={formData.billingCountry}
              setSelected={(value) =>
                setFormData({ ...formData, billingCountry: value })
              }
            />
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm mb-1 text-gray-700">
                  First name
                </label>
                <Input
                  type="text"
                  name="billingFirstName"
                  placeholder="First name"
                  value={formData.billingFirstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm mb-1 text-gray-700">
                  Last name
                </label>
                <Input
                  type="text"
                  name="billingLastName"
                  placeholder="Last name"
                  value={formData.billingLastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                Address
              </label>
              <Input
                type="text"
                name="billingAddress"
                placeholder="Address"
                value={formData.billingAddress}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                Apartment, suite, etc
              </label>
              <Input
                type="text"
                name="billingApartment"
                placeholder="Apartment, suite, etc. (optional)"
                value={formData.billingApartment}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm mb-1 text-gray-700">City</label>
                <Input
                  type="text"
                  name="billingCity"
                  placeholder="City"
                  value={formData.billingCity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm mb-1 text-gray-700">
                  Postal code
                </label>
                <Input
                  type="text"
                  name="billingPostalCode"
                  placeholder="Postal code"
                  value={formData.billingPostalCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POLICY NOTE */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <div className="flex items-start gap-2 mb-3">
          <div className="w-5 h-5 rounded-full border border-gray-900 flex items-center justify-center text-xs font-semibold mt-0.5">
            i
          </div>
          <p className="font-medium">
            Note: You may receive multiple packages for one order (local orders
            only)
          </p>
        </div>
        <ul className="pl-8 space-y-2 text-sm">
          {[
            "For nationwide orders, delivery will take 2–5 working days.",
            "For international orders, delivery will take 7–10 working days via DHL courier only.",
            "For international orders, VAT and duties will be paid by the customer.",
            `For any inquiries, reach out at Ogaan@gmail.com or call us at +92 00000000.`,
          ].map((item, index) => (
            <li key={index} className="flex gap-2">
              <span className="mt-2 w-1 h-1 bg-black rounded-full flex-shrink-0"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleSubmitOrder}
        disabled={isLoading}
        className={`w-full bg-[#1773b0] text-white text-lg font-medium py-3 rounded transition flex justify-center items-center ${
          isLoading
            ? "opacity-70 cursor-not-allowed"
            : "hover:bg-[#6e9dba] cursor-pointer"
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : selectedPayment === "cod" ? (
          "Complete Order"
        ) : (
          "Pay Now"
        )}
      </button>
    </div>
  );
};

export default CheckoutDetail;
