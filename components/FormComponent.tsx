"use client";

import React, { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Item {
  marca: string;
  placa: string;
  servico: string;
  pagamento: number;
  gorjeta: string; // Tratando gorjeta como string
  foiPago: boolean;
  metodoPagamento: string;
  parcelas: number;
}

export const FormComponent = () => {
  const [marca, setMarca] = useState("");
  const [placa, setPlaca] = useState("");
  const [servico, setServico] = useState("Peça Trocada");
  const [pagamento, setPagamento] = useState("20"); // Inicializa como string
  const [parcelas, setParcelas] = useState(1);
  const [foiPago, setFoiPago] = useState(false);
  const [lista, setLista] = useState<Item[]>([]);
  const [metodoPagamento, setMetodoPagamento] = useState("Pix");

  useEffect(() => {
    const storedList = localStorage.getItem("lista");
    if (storedList) {
      setLista(JSON.parse(storedList));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lista", JSON.stringify(lista));
  }, [lista]);

  const handleMarcaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarca(e.target.value);
  };
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaca(e.target.value);
  };
  const handleServicoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServico(e.target.value);
  };
  const handlePagamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPagamento(e.target.value);
  };
  const handleParcelasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParcelas(parseInt(e.target.value));
  };
  const handleFoiPagoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoiPago(e.target.checked);
  };
  const handleMetodoPagamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetodoPagamento(e.target.value);
  };

  const handleAdicionar = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const newItem: Item = {
      marca,
      placa,
      servico,
      pagamento: parseFloat(pagamento), // Converte para número ao adicionar
      gorjeta: "0", // Inicializa gorjeta como string
      foiPago,
      metodoPagamento,
      parcelas,
    };
    setLista([...lista, newItem]);

    setMarca("");
    setPlaca("");
    setServico("Peça Trocada");
    setPagamento("20"); // Reseta como string
    setFoiPago(false);
    setMetodoPagamento("Pix");
    setParcelas(1);
  };

  const handleCheckboxChange = (index: number) => {
    const updatedLista = lista.map((item, idx) => {
      if (idx === index) {
        return { ...item, foiPago: !item.foiPago };
      }
      return item;
    });
    setLista(updatedLista);
  };

  const handleGorjetaChangeInList = (index: number, value: string) => {
    const updatedLista = [...lista];
    updatedLista[index].gorjeta = value; // Mantém como string
    setLista(updatedLista);
  };

  const handleRemover = (index: number) => {
    const updatedLista = lista.filter((_, idx) => idx !== index);
    setLista(updatedLista);
  };

  const totalPagamento = lista
    .filter((item) => item.foiPago)
    .reduce((total, item) => total + item.pagamento, 0);

  const totalGorjeta = lista.reduce(
    (total, item) => total + parseFloat(item.gorjeta),
    0
  ); // Converte gorjeta para número

  const calculatePaymentDatesAndValues = (numParcelas: number, totalValue: number) => {
    const datesAndValues = [];
    const today = new Date();
    const parcelValue = totalValue / numParcelas;
    for (let i = 0; i < numParcelas; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() + i);
      const formattedDate = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      datesAndValues.push(`${formattedDate} - R$ ${parcelValue.toFixed(2)}`);
    }
    return datesAndValues;
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.text("Relatório do Dia", 14, 22);
    doc.text(
      `Data: ${new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) ?? ""
      }`,
      14,
      32
    );

    autoTable(doc, {
      head: [["Marca/Modelo", "Placa", "Serviço", "Valor", "Gorjeta", "Pago", "Método de Pagamento", "Parcelas", "Datas e Valores de Pagamento"]],
      body: lista.map((item) => [
        item.marca,
        item.placa,
        item.servico,
        `R$ ${item.pagamento.toFixed(2)}`,
        `R$ ${parseFloat(item.gorjeta).toFixed(2)}`,
        item.foiPago ? "Sim" : "Não",
        item.metodoPagamento,
        item.parcelas > 1 ? `${item.parcelas}x` : "À vista",
        item.metodoPagamento === "CartãoCredito" && item.parcelas > 1
          ? calculatePaymentDatesAndValues(item.parcelas, item.pagamento).join(", ")
          : "N/A",
      ]),
      startY: 40,
    });

    autoTable(doc, {
      body: [
        [`Total Caixa: R$ ${totalPagamento.toFixed(2)}`],
        [`Total Gorjeta: R$ ${totalGorjeta.toFixed(2)}`],
      ],
      startY: (doc as any).lastAutoTable.finalY + 10,
    });

    doc.save(
      `Relatorio_${new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) ?? ""
      }.pdf`
    );
  };

  const handleIniciarNovoDia = () => {
    const userConfirmed = window.confirm(
      "Você tem certeza que deseja apagar a lista atual?"
    );
    if (userConfirmed) {
      setLista([]);
      localStorage.removeItem("lista");
    } else {
      return;
    }
  };

  return (
    <>
      <div>
        <form>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#cd3200]">
              Marca/Modelo:
            </label>
            <input
              placeholder="Mercedes, Bmw, Tesla, Toyota..."
              className="border border-gray-300 focus:border-2 focus:border-[#cd3200] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              type="text"
              value={marca}
              onChange={handleMarcaChange}
            />
          </div>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#cd3200]">Placa/Nome:</label>
            <input
              placeholder="Placa do carro..."
              className="border border-gray-300 focus:border-2 focus:border-[#cd3200] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              type="text"
              value={placa}
              onChange={handlePlacaChange}
            />
          </div>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#cd3200]">Serviço:</label>
            <input
              placeholder="Peça, Trocada..."
              className="border border-gray-300 focus:border-2 focus:border-[#cd3200] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              type="text"
              value={servico}
              onChange={handleServicoChange}
            />
          </div>
          <div className="flex justify-between items-center px-2 gap-3">
            <div className="flex flex-col">
              <label className="font-semibold text-[#cd3200]">Valor:</label>
              <input
                className="border border-gray-300 focus:border-2 focus:border-[#cd3200] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8 w-64"
                type="text"
                value={pagamento}
                onChange={handlePagamentoChange}
              />
            </div>
            <div className="flex flex-col px-2">
              <label className="font-semibold text-[#cd3200]">Método de Pagamento:</label>
              <select
                value={metodoPagamento}
                onChange={handleMetodoPagamentoChange}
                className="border border-gray-300 focus:border-2 focus:border-[#cd3200] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-10"
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="Pix">Pix</option>
                <option value="CartãoDebito">Cartão Débito</option>
                <option value="CartãoCredito">Cartão Crédito</option>
              </select>
            </div>
            <div className="flex flex-col">
            <label className="font-semibold text-[#cd3200]">Parcelas:</label>
            <select
              className="border border-gray-300 focus:border-2 focus:border-[#cd3200] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-10 w-64"
              value={parcelas}
              onChange={handleParcelasChange}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}x
                </option>
              ))}
            </select>
          </div>
            <div className="flex gap-2 mr-4 mt-5">
              <label className="font-bold text-[#cd3200]">Pago</label>
              <input
                type="checkbox"
                id="pagamento"
                checked={foiPago}
                onChange={handleFoiPagoChange}
                className="w-6 h-6"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleAdicionar}
              className="bg-[#cd3200] p-2 w-80 rounded-full mt-10 text-white font-bold"
            >
              Adicionar
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="flex justify-center font-semibold text-xl text-[#cd3200] border-b border-gray-300">
            Lista de Clientes
          </h2>
          {lista.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-3 font-semibold text-md gap-2 border-b border-gray-300 p-4 relative"
            >
              <p className="flex flex-col font-bold">
                Marca:
                <span className="font-semibold"> {item.marca}</span>
              </p>
              <p className="flex flex-col font-bold">
                Placa:
                <span className="font-semibold"> {item.placa}</span>{" "}
              </p>
              <p className="flex flex-col font-bold">
                Serviço:
                <span className="font-semibold"> {item.servico}</span>
              </p>
              <p className="flex flex-col font-bold">
                Valor:
                <span className="font-semibold"> R$ {item.pagamento}</span>
              </p>
              <p className="flex flex-col font-bold">
                Método de Pagamento:
                <span className="font-semibold"> {item.metodoPagamento}</span>
              </p>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-[#cd3200]">Gorjeta:</label>
                  <input
                    type="text"
                    value={item.gorjeta}
                    onChange={(e) =>
                      handleGorjetaChangeInList(index, e.target.value)
                    }
                    className="h-8 w-16 border border-gray-300 focus:border-2 focus:border-[#cd3200] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-bold text-[#cd3200]">Pago</label>
                  <input
                    type="checkbox"
                    checked={item.foiPago}
                    onChange={() => handleCheckboxChange(index)}
                    className="w-6 h-6"
                  />
                </div>
                <button onClick={() => handleRemover(index)}>
                  <FaRegTrashAlt className="text-red-400 absolute right-0 top-3 mt-1 mr-3" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-col justify-center items-center p-4 mb-20 font-bold mt-4">
            <p className="text-lg">
              Total Caixa:
              <span className="text-[#cd3200] text-xl"> R$ {totalPagamento}</span>
            </p>
            <p className="text-lg">
              Total Gorjeta:
              <span className="text-[#cd3200] text-xl"> R$ {totalGorjeta}</span>
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={generatePDF}
              className="bg-[#cd3200] p-2 w-80 rounded-full text-white font-bold mb-20"
            >
              Criar Relatório do Dia
            </button>
          </div>
          <div className="flex flex-col justify-center items-center my-4">
            <button
              onClick={handleIniciarNovoDia}
              className="bg-green-600 p-2 w-80 rounded-full text-white font-bold mb-10"
            >
              Iniciar Novo Dia
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
