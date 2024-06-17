"use client";

import Image from "next/image";

import logo from "@/assets/logo-eletr.jpeg";
import logoEletrica from "@/assets/logo-eletrica-martins.png";
import logoEletr from "@/assets/logo-martins.png";
import { CalendarComponent } from "@/components/CalendarComponent";
import { FormComponent } from "@/components/FormComponent";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex justify-center items-center h-15 border-b-2 border-gray-390">
        <Image className="w-32" src={logo} alt="Logo Eletrica" />
        <Image className="w-32" src={logoEletrica} alt="Logo Auto Eletrica" />
        <Link href="https://www.instagram.com/eletrica.martinss/" target="_blank">
          <Image className="w-32" src={logoEletr} alt="Logo Eletr" />
        </Link>
      </div>
      <CalendarComponent />
      <FormComponent />
    </>
  );
}
