"use client";

import React, { useEffect, useState } from "react";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import Input from "../utilities/Input"; // Adjust path if needed
import BrowserIcon from "../utilities/BrowserIcon";

countries.registerLocale(en); // register English

const pakistaniCities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Bahawalpur", "Sargodha", "Sukkur", "Larkana", "Sheikhupura",
  "Rahim Yar Khan", "Jhang", "Dera Ghazi Khan", "Abbottabad",
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
          open ? "ring-[1.1px] ring-[#1773b0]" : "border-gray-300"
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
              className={`px-4 py-1.5 cursor-pointer transition-all duration-100 hover:bg-gray-100 leading-tight ${
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

const CheckoutDetail = () => {
  const [countriesList, setCountriesList] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("Pakistan");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);

  const [address, setAddress] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");

  useEffect(() => {
    const countryNames = countries.getNames("en", { select: "official" });
    setCountriesList(Object.values(countryNames));
  }, []);

  const isInternational = selectedCountry !== "Pakistan";
  const hasFilledFields = address && cityInput && state && postal;

  return (
    <div className="lg:w-1/2 p-6 space-y-6">
      {/* DELIVERY */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Delivery</h2>

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
            <label className="block text-sm mb-1 text-gray-700">First name</label>
            <Input type="text" placeholder="First name" />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1 text-gray-700">Last name</label>
            <Input type="text" placeholder="Last name" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-1 text-gray-700">Address</label>
          <Input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-1 text-gray-700">Apartment, suite, etc</label>
          <Input type="text" placeholder="Apartment, suite, etc. (optional)" />
        </div>

        {isInternational && (
          <div className="flex gap-4 mt-4">
            <div className="w-1/3">
              <label className="block text-sm mb-1 text-gray-700">City</label>
              <Input type="text" placeholder="City" value={cityInput} onChange={(e) => setCityInput(e.target.value)} />
            </div>
            <div className="w-1/3">
              <label className="block text-sm mb-1 text-gray-700">State / Territory</label>
              <Input type="text" placeholder="State / Territory" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div className="w-1/3">
              <label className="block text-sm mb-1 text-gray-700">Postal Code</label>
              <Input type="text" placeholder="Postal Code" value={postal} onChange={(e) => setPostal(e.target.value)} />
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm mb-1 text-gray-700">Phone</label>
          <Input type="tel" placeholder="Phone" />
        </div>
      </div>

      {/* SHIPPING METHOD */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Shipping Method</h2>
        <div className={isInternational ? `flex justify-between items-center bg-gray-100 rounded px-4 py-4 text-gray-800` : `flex justify-between items-center border border-[#1773b0] bg-blue-50 rounded px-4 py-3`}>
          <span className="text-sm">
            {isInternational
              ? hasFilledFields
                ? "DHL Express"
                : "Enter your shipping address to view available shipping methods"
              : "Standard"}
          </span>
          <span className="text-sm">
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
        <h2 className="text-xl font-semibold mb-2">Payment</h2>
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
             <div className="flex flex-col justify-center items-center w-full max-w-[600px] min-h-[12rem] bg-gray-100 rounded p-4 sm:p-6">

                  <BrowserIcon />
                  <p className="text-sm text-center max-w-xs sm:max-w-sm mb-5">
                  After clicking “Pay now”, you will be redirected to Paypal to complete your purchase securely.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BILLING ADDRESS */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Billing Address</h2>
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
              selected={selectedCountry}
              setSelected={setSelectedCountry}
            />
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm mb-1 text-gray-700">First name</label>
                <Input type="text" placeholder="First name" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm mb-1 text-gray-700">Last name</label>
                <Input type="text" placeholder="Last name" />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">Address</label>
              <Input type="text" placeholder="Address" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">Apartment, suite, etc</label>
              <Input type="text" placeholder="Apartment, suite, etc. (optional)" />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm mb-1 text-gray-700">City</label>
                <Input type="text" placeholder="City" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm mb-1 text-gray-700">Postal code</label>
                <Input type="text" placeholder="Postal code" />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">Phone</label>
              <Input type="tel" placeholder="Phone" />
            </div>
          </div>
        )}
      </div>

      {/* POLICY NOTE */}
      <div className="bg-gray-100 p-6 text-sm text-black rounded-lg">
        <div className="flex items-start gap-2 mb-3">
          <div className="w-5 h-5 pt-1 rounded-full border border-gray-900 text-black flex items-center justify-center text-xs font-semibold mt-0.5">
            i
          </div>
          <p className="font-medium">
            Note: You may receive multiple packages for one order (local orders only)
          </p>
        </div>
        <ul className="pl-8 space-y-2 text-[13px]">
          <li className="flex gap-2">
            <span className="mt-2 w-1 h-1 bg-black rounded-full flex-shrink-0"></span>
            <span>For nationwide orders, delivery will take 2–5 working days.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 w-1 h-1 bg-black rounded-full flex-shrink-0"></span>
            <span>For international orders, delivery will take 7–10 working days via DHL courier only.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 w-1 h-1 bg-black rounded-full flex-shrink-0"></span>
            <span>For international orders, VAT and duties will be paid by the customer.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 w-1 h-1 bg-black rounded-full flex-shrink-0"></span>
            <span>
              For any inquiries, reach out at{" "}
              <span className="text-gray-700 hover:underline">Ogaan@gmail.com</span>{" "}
              or call us at{" "}
              <span className="text-gray-700 hover:underline">+92 00000000</span>.
            </span>
          </li>
        </ul>
      </div>

      {/* SUBMIT BUTTON */}
      <button className="w-full bg-[#1773b0] text-white text-lg font-medium py-3 rounded hover:bg-[#6e9dba] transition cursor-pointer">
        {selectedPayment === "cod" ? "Complete Order" : "Pay Now"}
      </button>
    </div>
  );
};

export default CheckoutDetail;
