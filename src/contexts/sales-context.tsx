
// src/contexts/sales-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SELLERS, ALL_SELLERS_OPTION, LOCAL_STORAGE_SALES_KEY, AREA_OPTIONS, STATUS_OPTIONS, COMPANY_OPTIONS } from '@/lib/constants';
import type { Sale, Seller, SalesContextType, SalesFilters } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

/**
 * DADOS INICIAIS PARA O VENDEDOR SERGIO.
 * Estes dados serão carregados se o localStorage para 'salesAppData' estiver VAZIO.
 * Se você já usou a aplicação e tem dados salvos, precisará limpar o localStorage
 * (Ferramentas de Desenvolvedor do Navegador > Application > Local Storage > clique com o botão direito em salesAppData > Delete)
 * para que estes dados iniciais sejam carregados.
 */
const exampleSalesForSergio: Sale[] = [
  {
    id: "f8c1e8c7-a4e2-4f03-b7d8-3e9c1b2a7f5e",
    seller: "SERGIO",
    date: "2025-01-01",
    company: "CLIMAZONE",
    project: "1558",
    os: "",
    area: "INST. AC",
    clientService: "FEMAX - DIST. ACIOLY - SÓ M.O. INST. SPLITS",
    salesValue: 75000.00,
    status: "EM ANDAMENTO",
    payment: 38250.00,
    createdAt: new Date("2025-01-01T00:00:00.000Z").getTime()
  },
  {
    id: "a2b3e4d5-c6f7-4a8b-9c1d-0e1f2a3b4c5d",
    seller: "SERGIO",
    date: "2025-01-02",
    company: "ENGEAR",
    project: "1600",
    os: "",
    area: "INST. AC",
    clientService: "USINA GIASA - INST. SPLITÃO",
    salesValue: 82800.00,
    status: "FINALIZADO",
    payment: 82800.00,
    createdAt: new Date("2025-01-02T00:00:00.000Z").getTime()
  },
  {
    id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    seller: "SERGIO",
    date: "2025-01-02",
    company: "ENGEAR",
    project: "1625",
    os: "90",
    area: "GÁS",
    clientService: "CONNOR ENGENHARIA - A&C - T.E. TANQUE",
    salesValue: 1900.00,
    status: "FINALIZADO",
    payment: 1900.00,
    createdAt: new Date("2025-01-02T00:00:00.000Z").getTime()
  },
  {
    id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8g",
    seller: "SERGIO",
    date: "2025-01-02",
    company: "CLIMAZONE",
    project: "1627",
    os: "27",
    area: "AQG",
    clientService: "LINK MOTEL - ALPHAVILLE- INST. BOILER",
    salesValue: 3000.00,
    status: "FINALIZADO",
    payment: 3000.00,
    createdAt: new Date("2025-01-02T00:00:00.000Z").getTime()
  },
  {
    id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8g9h",
    seller: "SERGIO",
    date: "2025-01-02",
    company: "CLIMAZONE",
    project: "1628",
    os: "26",
    area: "MANUT. AC",
    clientService: "HOTEL SLAVIERO (ANDRADE MARINHO LMF)",
    salesValue: 3600.00,
    status: "FINALIZADO",
    payment: 3600.00,
    createdAt: new Date("2025-01-02T00:00:00.000Z").getTime()
  },
  {
    id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8g9h0i",
    seller: "SERGIO",
    date: "2025-01-03",
    company: "ENGEAR",
    project: "1632",
    os: "104",
    area: "CI",
    clientService: "MENOR PREÇO - INTERMARES - INST. BOMBA",
    salesValue: 1300.00,
    status: "FINALIZADO",
    payment: 1300.00,
    createdAt: new Date("2025-01-03T00:00:00.000Z").getTime()
  },
  {
    id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8g9h0i1j",
    seller: "SERGIO",
    date: "2025-01-04",
    company: "CLIMAZONE",
    project: "1637",
    os: "29",
    area: "AQG",
    clientService: "DANIEL GALVÃO FORTE - INST. AQ. RINNAI",
    salesValue: 450.00,
    status: "FINALIZADO",
    payment: 450.00,
    createdAt: new Date("2025-01-04T00:00:00.000Z").getTime()
  },
  {
    id: "b8c9d0e1-f2a3-4b4c-5d6e-7f8g9h0i1j2k",
    seller: "SERGIO",
    date: "2025-01-13",
    company: "ENGEAR",
    project: "1638",
    os: "93",
    area: "INST. AC",
    clientService: "R&M CONSTRUTORA - OBRA JF - TONY",
    salesValue: 32000.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-01-13T00:00:00.000Z").getTime()
  },
  {
    id: "c9d0e1f2-a3b4-4c5d-6e7f-8g9h0i1j2k3l",
    seller: "SERGIO",
    date: "2025-01-16",
    company: "CLIMAZONE",
    project: "1639",
    os: "",
    area: "INST. AC",
    clientService: "KLEYTON - INST. SPLIT",
    salesValue: 700.00,
    status: "FINALIZADO",
    payment: 700.00,
    createdAt: new Date("2025-01-16T00:00:00.000Z").getTime()
  },
  {
    id: "d0e1f2a3-b4c5-4d6e-7f8g-9h0i1j2k3l4m",
    seller: "SERGIO",
    date: "2025-01-16",
    company: "CLIMAZONE",
    project: "1640",
    os: "",
    area: "GÁS",
    clientService: "KLEYTON - INST. MEDIDOR E KIT",
    salesValue: 900.00,
    status: "FINALIZADO",
    payment: 900.00,
    createdAt: new Date("2025-01-16T00:00:00.000Z").getTime()
  },
  {
    id: "e1f2a3b4-c5d6-4e7f-8g9h-0i1j2k3l4m5n",
    seller: "SERGIO",
    date: "2025-01-16",
    company: "CLIMAZONE",
    project: "1641",
    os: "",
    area: "GÁS",
    clientService: "ADR2 - EDF. MARENA - REDE DE GÁS",
    salesValue: 26900.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-01-16T00:00:00.000Z").getTime()
  },
  {
    id: "f2a3b4c5-d6e7-4f8g-9h0i-1j2k3l4m5n6o",
    seller: "SERGIO",
    date: "2025-01-16",
    company: "CLIMAZONE",
    project: "1642",
    os: "",
    area: "PRÉ",
    clientService: "ADR2 - EDF. MARENA - PRÉ  150 CADA +/- 250 UNID.",
    salesValue: 37500.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-01-16T00:00:00.000Z").getTime()
  },
  {
    id: "a3b4c5d6-e7f8-4a9b-0i1j-2k3l4m5n6o7p",
    seller: "SERGIO",
    date: "2025-01-16",
    company: "CLIMAZONE",
    project: "1644",
    os: "",
    area: "GÁS",
    clientService: "MENOR PREÇO - ALTIPLANO",
    salesValue: 8000.00,
    status: "EM ANDAMENTO",
    payment: 8000.00,
    createdAt: new Date("2025-01-16T00:00:00.000Z").getTime()
  },
  {
    id: "b4c5d6e7-f8a9-4b0c-1j2k-3l4m5n6o7p8q",
    seller: "SERGIO",
    date: "2025-01-16",
    company: "CLIMAZONE",
    project: "1645",
    os: "",
    area: "GÁS",
    clientService: "UNIPE - UNIVERSIDADE CRUZ. DO SUL - 2X T.E .",
    salesValue: 2600.00,
    status: "FINALIZADO",
    payment: 2600.00,
    createdAt: new Date("2025-01-16T00:00:00.000Z").getTime()
  },
  {
    id: "c5d6e7f8-a9b0-4c1d-2k3l-4m5n6o7p8q9r",
    seller: "SERGIO",
    date: "2025-01-16",
    company: "CLIMAZONE",
    project: "1647",
    os: "",
    area: "GÁS",
    clientService: "MEGA ATACAREJO - VALENTINA",
    salesValue: 900.00,
    status: "FINALIZADO",
    payment: 0.00,
    createdAt: new Date("2025-01-16T00:00:00.000Z").getTime()
  },
  {
    id: "d6e7f8a9-b0c1-4d2e-3l4m-5n6o7p8q9r0s",
    seller: "SERGIO",
    date: "2025-01-16",
    company: "ENGEAR",
    project: "1648",
    os: "94",
    area: "MANUT. AC",
    clientService: "IF PARTCIPAÇÕES",
    salesValue: 2550.00,
    status: "FINALIZADO",
    payment: 2550.00,
    createdAt: new Date("2025-01-16T00:00:00.000Z").getTime()
  },
  {
    id: "e7f8a9b0-c1d2-4e3f-4m5n-6o7p8q9r0s1t",
    seller: "SERGIO",
    date: "2025-01-22",
    company: "CLIMAZONE",
    project: "1649",
    os: "",
    area: "AQG",
    clientService: "PATRICIO LEAL - INST. PRESSURIZADOR",
    salesValue: 250.00,
    status: "FINALIZADO",
    payment: 250.00,
    createdAt: new Date("2025-01-22T00:00:00.000Z").getTime()
  },
  {
    id: "f8a9b0c1-d2e3-4f4a-5n6o-7p8q9r0s1t2u",
    seller: "SERGIO",
    date: "2025-01-22",
    company: "ENGEAR",
    project: "1655",
    os: "109",
    area: "CI",
    clientService: "HOSP. MEM. S. FRANCISCO - ENG. DIEGO",
    salesValue: 11823.00,
    status: "FINALIZADO",
    payment: 11823.00,
    createdAt: new Date("2025-01-22T00:00:00.000Z").getTime()
  },
  {
    id: "a9b0c1d2-e3f4-4a5b-6o7p-8q9r0s1t2u3v",
    seller: "SERGIO",
    date: "2025-01-22",
    company: "CLIMAZONE",
    project: "1659",
    os: "43",
    area: "INST. AC",
    clientService: "DATERRA OLIMPICO- SÓ M.O. INST. AC A. COMUNS",
    salesValue: 18000.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-01-22T00:00:00.000Z").getTime()
  },
  {
    id: "b0c1d2e3-f4a5-4b6c-7p8q-9r0s1t2u3v4w",
    seller: "SERGIO",
    date: "2025-01-29",
    company: "CLIMAZONE",
    project: "1666",
    os: "34",
    area: "SAS",
    clientService: "ODILON J. LINS FALCÃO - SÓ VENDA COLET. SOLAR",
    salesValue: 3590.00,
    status: "FINALIZADO",
    payment: 3590.00,
    createdAt: new Date("2025-01-29T00:00:00.000Z").getTime()
  },
  {
    id: "c1d2e3f4-a5b6-4c7d-8q9r-0s1t2u3v4w5x",
    seller: "SERGIO",
    date: "2025-01-29",
    company: "CLIMAZONE",
    project: "1670",
    os: "35",
    area: "GÁS",
    clientService: "CLUBE DOS OFICIAIS -  GÁS - ENG. DIEGO",
    salesValue: 1400.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-01-29T00:00:00.000Z").getTime()
  },
  {
    id: "d2e3f4a5-b6c7-4d8e-9r0s-1t2u3v4w5x6y",
    seller: "SERGIO",
    date: "2025-01-29",
    company: "ENGEAR",
    project: "1671",
    os: "100",
    area: "AQG",
    clientService: "ELLY - DINACIM ENGNHARIA - SÓ VISITA",
    salesValue: 180.00,
    status: "FINALIZADO",
    payment: 0.00,
    createdAt: new Date("2025-01-29T00:00:00.000Z").getTime()
  },
  {
    id: "e3f4a5b6-c7d8-4e9f-0s1t-2u3v4w5x6y7z",
    seller: "SERGIO",
    date: "2025-01-29",
    company: "CLIMAZONE",
    project: "1672",
    os: "36",
    area: "AQG",
    clientService: "MAIA EMPREENDIMENTOS - ANELISE",
    salesValue: 900.00,
    status: "FINALIZADO",
    payment: 0.00,
    createdAt: new Date("2025-01-29T00:00:00.000Z").getTime()
  },
  {
    id: "f4a5b6c7-d8e9-4f0a-1t2u-3v4w5x6y7z0a",
    seller: "SERGIO",
    date: "2025-02-02",
    company: "CLIMAZONE",
    project: "1674",
    os: "37",
    area: "GÁS",
    clientService: "DELTA - EDF. TAI - SÓ M.O. INST. REDE DE GÁS  - P.G.",
    salesValue: 21000.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-02-02T00:00:00.000Z").getTime()
  },
  {
    id: "a5b6c7d8-e9f0-4a1b-2u3v-4w5x6y7z0a1b",
    seller: "SERGIO",
    date: "2025-02-02",
    company: "ENGEAR",
    project: "1675",
    os: "101",
    area: "GÁS",
    clientService: "COND. APHAVILLE - REG. REDE DE GÁS 2X",
    salesValue: 1000.00,
    status: "FINALIZADO",
    payment: 1000.00,
    createdAt: new Date("2025-02-02T00:00:00.000Z").getTime()
  },
  {
    id: "b6c7d8e9-f0a1-4b2c-3v4w-5x6y7z0a1b2c",
    seller: "SERGIO",
    date: "2025-02-02",
    company: "ENGEAR",
    project: "1676",
    os: "38",
    area: "INST. AC",
    clientService: "ID ENGENHARIA - ENG. DIEGO - REG. SPLITS HMSF",
    salesValue: 6290.00,
    status: "Á INICIAR",
    payment: 0.00,
    createdAt: new Date("2025-02-02T00:00:00.000Z").getTime()
  },
  {
    id: "c7d8e9f0-a1b2-4c3d-4w5x-6y7z0a1b2c3d",
    seller: "SERGIO",
    date: "2025-02-02",
    company: "CLIMAZONE",
    project: "1677",
    os: "102",
    area: "GÁS",
    clientService: "ID ENGENHARIA - ENG. DIEGO - REALOC. GÁS",
    salesValue: 7000.00,
    status: "Á INICIAR",
    payment: 0.00,
    createdAt: new Date("2025-02-02T00:00:00.000Z").getTime()
  },
  {
    id: "d8e9f0a1-b2c3-4d4e-5x6y-7z0a1b2c3d4e",
    seller: "SERGIO",
    date: "2025-02-03",
    company: "CLIMAZONE",
    project: "1678",
    os: "39",
    area: "MANUT. AC",
    clientService: "CASA NORTE - NATAL RN - MANUT. AC",
    salesValue: 10000.00,
    status: "FINALIZADO",
    payment: 10000.00,
    createdAt: new Date("2025-02-03T00:00:00.000Z").getTime()
  },
  {
    id: "e9f0a1b2-c3d4-4e5f-6y7z-0a1b2c3d4e5f",
    seller: "SERGIO",
    date: "2025-02-03",
    company: "CLIMAZONE",
    project: "1679",
    os: "41",
    area: "EXAUST",
    clientService: "DCT - SINT AC E EXASUTÃO",
    salesValue: 9000.00,
    status: "FINALIZADO",
    payment: 9000.00,
    createdAt: new Date("2025-02-03T00:00:00.000Z").getTime()
  },
  {
    id: "f0a1b2c3-d4e5-4f6a-7z0a-1b2c3d4e5f6g",
    seller: "SERGIO",
    date: "2025-02-03",
    company: "CLIMAZONE",
    project: "1680",
    os: "40",
    area: "MANUT. AC",
    clientService: "INTERMARES HALL",
    salesValue: 10000.00,
    status: "FINALIZADO",
    payment: 10000.00,
    createdAt: new Date("2025-02-03T00:00:00.000Z").getTime()
  },
  {
    id: "a1b2c3d4-e5f6-4a7b-0a1b-2c3d4e5f6g7h",
    seller: "SERGIO",
    date: "2025-02-10",
    company: "CLIMAZONE",
    project: "1685",
    os: "",
    area: "CI",
    clientService: "MENOR PREÇO ALTIPLANO - SÓ M.O.",
    salesValue: 24000.00,
    status: "Á INICIAR",
    payment: 24000.00,
    createdAt: new Date("2025-02-10T00:00:00.000Z").getTime()
  },
  {
    id: "b2c3d4e5-f6a7-4b8c-1b2c-3d4e5f6g7h8i",
    seller: "SERGIO",
    date: "2025-02-11",
    company: "CLIMAZONE",
    project: "1682",
    os: "104",
    area: "CI",
    clientService: "MENOR PREÇO INTERMARES  - SUBST. PRESSOTATO.",
    salesValue: 1500.00,
    status: "FINALIZADO",
    payment: 1500.00,
    createdAt: new Date("2025-02-11T00:00:00.000Z").getTime()
  },
  {
    id: "c3d4e5f6-a7b8-4c9d-2c3d-4e5f6g7h8i9j",
    seller: "SERGIO",
    date: "2025-02-12",
    company: "ENGEAR",
    project: "1687",
    os: "106",
    area: "MANUT. AC",
    clientService: "MULTI CONTRUÇÕES - MANUT. SPLIT",
    salesValue: 80000.00,
    status: "Á INICIAR",
    payment: 22000.00,
    createdAt: new Date("2025-02-12T00:00:00.000Z").getTime()
  },
  {
    id: "d4e5f6a7-b8c9-4d0e-3d4e-5f6g7h8i9j0k",
    seller: "SERGIO",
    date: "2025-02-11",
    company: "CLIMAZONE",
    project: "1688",
    os: "105",
    area: "CI",
    clientService: "MEGA ATACAREJO - MUDANÇA NO RECALQUE DE CI",
    salesValue: 1700.00,
    status: "FINALIZADO",
    payment: 1700.00,
    createdAt: new Date("2025-02-11T00:00:00.000Z").getTime()
  },
  {
    id: "e5f6a7b8-c9d0-4e1f-4e5f-6g7h8i9j0k1l",
    seller: "SERGIO",
    date: "2025-02-12",
    company: "CLIMAZONE",
    project: "1689",
    os: "107",
    area: "AQG",
    clientService: "TONY E KÉZIA - ALPHAVILLE - SUBST. RESISTENCIA",
    salesValue: 750.00,
    status: "FINALIZADO",
    payment: 750.00,
    createdAt: new Date("2025-02-12T00:00:00.000Z").getTime()
  },
  {
    id: "f6a7b8c9-d0e1-4f2a-5f6g-7h8i9j0k1l2m",
    seller: "SERGIO",
    date: "2025-02-13",
    company: "CLIMAZONE",
    project: "1690",
    os: "42",
    area: "AQG",
    clientService: "CAMILA FIGUEIREDO - REVISÃO TERMOSTATO BOILER",
    salesValue: 0.00,
    status: "FINALIZADO",
    payment: 0.00,
    createdAt: new Date("2025-02-13T00:00:00.000Z").getTime()
  },
  {
    id: "a7b8c9d0-e1f2-4a3b-6g7h-8i9j0k1l2m3n",
    seller: "SERGIO",
    date: "2025-02-13",
    company: "CLIMAZONE",
    project: "1691",
    os: "44",
    area: "INST. AC",
    clientService: "JORGE CRISPIM (SR. ROMERIO)  - ALPHAVILLE - INST K7",
    salesValue: 19000.00,
    status: "FINALIZADO",
    payment: 19000.00,
    createdAt: new Date("2025-02-13T00:00:00.000Z").getTime()
  },
  {
    id: "b8c9d0e1-f2a3-4b4c-7h8i-9j0k1l2m3n4o",
    seller: "SERGIO",
    date: "2025-02-18",
    company: "CLIMAZONE",
    project: "1695",
    os: "46",
    area: "INST. AC",
    clientService: "ARCO CONST. FORN. E INST. AC CORAIS DE A. DOURADA",
    salesValue: 75000.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-02-18T00:00:00.000Z").getTime()
  },
  {
    id: "c9d0e1f2-a3b4-4c5d-8i9j-0k1l2m3n4o5p",
    seller: "SERGIO",
    date: "2025-02-19",
    company: "CLIMAZONE",
    project: "1696",
    os: "45",
    area: "MANUT. AC",
    clientService: "DR. OSMINDO ALPHAVILLE",
    salesValue: 2600.00,
    status: "FINALIZADO",
    payment: 2600.00,
    createdAt: new Date("2025-02-19T00:00:00.000Z").getTime()
  },
  {
    id: "d0e1f2a3-b4c5-4d6e-9j0k-1l2m3n4o5p6q",
    seller: "SERGIO",
    date: "2025-02-24",
    company: "CLIMAZONE",
    project: "1698",
    os: "",
    area: "INST. AC",
    clientService: "VEXA ACABAMENTOS",
    salesValue: 130000.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-02-24T00:00:00.000Z").getTime()
  },
  {
    id: "e1f2a3b4-c5d6-4e7f-0k1l-2m3n4o5p6q7r",
    seller: "SERGIO",
    date: "2025-02-26",
    company: "ENGEAR",
    project: "1711",
    os: "111",
    area: "GÁS",
    clientService: "SONHO DOCE  MANAÍRA SHOPPING - T.E. LAUDO E ART.",
    salesValue: 976.00,
    status: "FINALIZADO",
    payment: 976.00,
    createdAt: new Date("2025-02-26T00:00:00.000Z").getTime()
  },
  {
    id: "f2a3b4c5-d6e7-4f8g-1l2m-3n4o5p6q7r8s",
    seller: "SERGIO",
    date: "2025-02-26",
    company: "ENGEAR",
    project: "1712",
    os: "110",
    area: "GÁS",
    clientService: "KFC - MANAÍRA SHOPPING - T.E. LAUDO E ART.",
    salesValue: 976.00,
    status: "FINALIZADO",
    payment: 976.00,
    createdAt: new Date("2025-02-26T00:00:00.000Z").getTime()
  },
  {
    id: "a3b4c5d6-e7f8-4a9b-2m3n-4o5p6q7r8s9t",
    seller: "SERGIO",
    date: "2025-02-26",
    company: "CLIMAZONE",
    project: "1713",
    os: "",
    area: "SAS",
    clientService: "SR. MURILO - ALPHAVILLE - DESINSTALAÇÃO COLETORES",
    salesValue: 450.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-02-26T00:00:00.000Z").getTime()
  },
  {
    id: "b4c5d6e7-f8a9-4b0c-3n4o-5p6q7r8s9t0u",
    seller: "SERGIO",
    date: "2025-02-26",
    company: "CLIMAZONE",
    project: "1714",
    os: "112",
    area: "SAS",
    clientService: "SR. PEDRO VITOR - ALPHAVILLE 3X COLETOR SOLAR",
    salesValue: 5800.00,
    status: "FINALIZADO",
    payment: 5800.00,
    createdAt: new Date("2025-02-26T00:00:00.000Z").getTime()
  },
  {
    id: "c5d6e7f8-a9b0-4c1d-4o5p-6q7r8s9t0u1v",
    seller: "SERGIO",
    date: "2025-03-12",
    company: "CLIMAZONE",
    project: "1721",
    os: "47",
    area: "INST. AC",
    clientService: "IJAI NÁBREGA - INST. K7 36K",
    salesValue: 2000.00,
    status: "CANCELADO",
    payment: 0.00,
    createdAt: new Date("2025-03-12T00:00:00.000Z").getTime()
  },
  {
    id: "d6e7f8a9-b0c1-4d2e-5p6q-7r8s9t0u1v2w",
    seller: "SERGIO",
    date: "2025-03-17",
    company: "CLIMAZONE",
    project: "1724",
    os: "",
    area: "GÁS",
    clientService: "RANIERE SARAIVA - REDE DE GÁS",
    salesValue: 2600.00,
    status: "Á INICIAR",
    payment: 0.00,
    createdAt: new Date("2025-03-17T00:00:00.000Z").getTime()
  },
  {
    id: "e7f8a9b0-c1d2-4e3f-6q7r-8s9t0u1v2w3x",
    seller: "SERGIO",
    date: "2025-03-17",
    company: "ENGEAR",
    project: "1726",
    os: "",
    area: "GÁS",
    clientService: "COND. ALPHAVILLE - REG. VAZAMENTO",
    salesValue: 1630.00,
    status: "FINALIZADO",
    payment: 1630.00,
    createdAt: new Date("2025-03-17T00:00:00.000Z").getTime()
  },
  {
    id: "f8a9b0c1-d2e3-4f4a-7r8s-9t0u1v2w3x4y",
    seller: "SERGIO",
    date: "2025-03-18",
    company: "CLIMAZONE",
    project: "1728",
    os: "",
    area: "EXAUST",
    clientService: "BOSSA DESIGN HOTEL",
    salesValue: 16000.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-03-18T00:00:00.000Z").getTime()
  },
  {
    id: "a9b0c1d2-e3f4-4a5b-8s9t-0u1v2w3x4y5z",
    seller: "SERGIO",
    date: "2025-03-21",
    company: "ENGEAR",
    project: "1737",
    os: "",
    area: "GÁS",
    clientService: "WANESSA ARRUDA - INST. AQ., KIT E CONVERSÃO",
    salesValue: 900.00,
    status: "FINALIZADO",
    payment: 900.00,
    createdAt: new Date("2025-03-21T00:00:00.000Z").getTime()
  },
  {
    id: "b0c1d2e3-f4a5-4b6c-9t0u-1v2w3x4y5z6a",
    seller: "SERGIO",
    date: "2025-03-27",
    company: "ENGEAR",
    project: "1766",
    os: "132",
    area: "LOCAÇÃO",
    clientService: "ENGIE - LOCAÇÃO SUAPE 4 DIARIAS",
    salesValue: 10000.00,
    status: "FINALIZADO",
    payment: 10000.00,
    createdAt: new Date("2025-03-27T00:00:00.000Z").getTime()
  },
  {
    id: "c1d2e3f4-a5b6-4c7d-0u1v-2w3x4y5z6a7b",
    seller: "SERGIO",
    date: "2025-04-04",
    company: "CLIMAZONE",
    project: "1757",
    os: "129",
    area: "MANUT. AC",
    clientService: "MAG SHOPPING",
    salesValue: 0.00,
    status: "Á INICIAR",
    payment: 0.00,
    createdAt: new Date("2025-04-04T00:00:00.000Z").getTime()
  },
  {
    id: "d2e3f4a5-b6c7-4d8e-1v2w-3x4y5z6a7b8c",
    seller: "SERGIO",
    date: "2025-04-15",
    company: "ENGEAR",
    project: "1771",
    os: "",
    area: "GÁS",
    clientService: "SONIVALDO - REDE DE GÁS LAVANDERIA ACQUALIS",
    salesValue: 5000.00,
    status: "EM ANDAMENTO",
    payment: 0.00,
    createdAt: new Date("2025-04-15T00:00:00.000Z").getTime()
  },
  {
    id: "e3f4a5b6-c7d8-4e9f-2w3x-4y5z6a7b8c9d",
    seller: "SERGIO",
    date: "2025-04-15",
    company: "ENGEAR",
    project: "1772",
    os: "",
    area: "GÁS",
    clientService: "EDF. LECADRE - CONST. ATRIOS REG.VAZAMENTO - GARANTIA",
    salesValue: 0.00,
    status: "FINALIZADO",
    payment: 0.00,
    createdAt: new Date("2025-04-15T00:00:00.000Z").getTime()
  },
  {
    id: "f4a5b6c7-d8e9-4f0a-3x4y-5z6a7b8c9d0e",
    seller: "SERGIO",
    date: "2025-04-23",
    company: "CLIMAZONE",
    project: "1774",
    os: "",
    area: "AQG",
    clientService: "HOTEL ANJOS - SR. MICHAEL",
    salesValue: 4000.00,
    status: "Á INICIAR",
    payment: 0.00,
    createdAt: new Date("2025-04-23T00:00:00.000Z").getTime()
  },
  {
    id: "a5b6c7d8-e9f0-4a1b-4y5z-6a7b8c9d0e1f",
    seller: "SERGIO",
    date: "2025-04-25",
    company: "CLIMAZONE",
    project: "1800",
    os: "",
    area: "AQG",
    clientService: "DR. BERILO PAI - SUBT.  PRESSURIZADORCONTROLADOR",
    salesValue: 0.00,
    status: "FINALIZADO",
    payment: 0.00,
    createdAt: new Date("2025-04-25T00:00:00.000Z").getTime()
  },
  {
    id: "b6c7d8e9-f0a1-4b2c-5z6a-7b8c9d0e1f2g",
    seller: "SERGIO",
    date: "2025-05-05",
    company: "CLIMAZONE",
    project: "1803",
    os: "63",
    area: "AQG",
    clientService: "SR. ARAKEN - SUBST. COLETOR SOLAR",
    salesValue: 2707.00,
    status: "FINALIZADO",
    payment: 2707.00,
    createdAt: new Date("2025-05-05T00:00:00.000Z").getTime()
  },
  {
    id: "c7d8e9f0-a1b2-4c3d-6a7b-8c9d0e1f2g3h",
    seller: "SERGIO",
    date: "2025-05-07",
    company: "CLIMAZONE",
    project: "1804",
    os: "64",
    area: "INST. AC",
    clientService: "BENEDITO - INST. VRF SAMSUNG",
    salesValue: 13000.00,
    status: "Á INICIAR",
    payment: 0.00,
    createdAt: new Date("2025-05-07T00:00:00.000Z").getTime()
  },
  {
    id: "d8e9f0a1-b2c3-4d4e-7b8c-9d0e1f2g3h4i",
    seller: "SERGIO",
    date: "2025-05-07",
    company: "CLIMAZONE",
    project: "1805",
    os: "138",
    area: "GÁS",
    clientService: "MENOR PREÇO - ADICIONAIS GÁS E CI",
    salesValue: 3215.00,
    status: "FINALIZADO",
    payment: 3215.00,
    createdAt: new Date("2025-05-07T00:00:00.000Z").getTime()
  },
  {
    id: "e9f0a1b2-c3d4-4e5f-8c9d-0e1f2g3h4i5j",
    seller: "SERGIO",
    date: "2025-05-12",
    company: "CLIMAZONE",
    project: "1813",
    os: "",
    area: "GÁS",
    clientService: "TYH",
    salesValue: 350.00,
    status: "FINALIZADO",
    payment: 350.00,
    createdAt: new Date("2025-05-12T00:00:00.000Z").getTime()
  },
  {
    id: "f0a1b2c3-d4e5-4f6a-9d0e-1f2g3h4i5j6k",
    seller: "SERGIO",
    date: "2025-05-13",
    company: "CLIMAZONE",
    project: "1814",
    os: "",
    area: "GÁS",
    clientService: "MM ENGENHARIA - INST. REGISTROS BLOQUEIO",
    salesValue: 1900.00,
    status: "FINALIZADO",
    payment: 1900.00,
    createdAt: new Date("2025-05-13T00:00:00.000Z").getTime()
  },
  {
    id: "a1b2c3d4-e5f6-4a7b-0e1f-2g3h4i5j6k7l",
    seller: "SERGIO",
    date: "2025-05-21",
    company: "CLIMAZONE",
    project: "1822",
    os: "",
    area: "AQG",
    clientService: "DR. REGIS BONFIM - ALPHAVILE SÓ INSTALAÇÃO",
    salesValue: 390.00,
    status: "FINALIZADO",
    payment: 0.00,
    createdAt: new Date("2025-05-21T00:00:00.000Z").getTime()
  },
  {
    id: "b2c3d4e5-f6a7-4b8c-1f2g-3h4i5j6k7l8m",
    seller: "SERGIO",
    date: "2025-05-21",
    company: "CLIMAZONE",
    project: "1823",
    os: "",
    area: "EXAUST",
    clientService: "WL MARCOLINO - INST. DUTOS COIFAS E VENTILADORES",
    salesValue: 10000.00,
    status: "Á INICIAR",
    payment: 0.00,
    createdAt: new Date("2025-05-21T00:00:00.000Z").getTime()
  }
];


export const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSeller, setSelectedSellerState] = useState<Seller | typeof ALL_SELLERS_OPTION>(ALL_SELLERS_OPTION);
  const [filters, setFiltersState] = useState<SalesFilters>({});
  const [loading, setLoading] = useState(true); // Começa true para indicar carregamento inicial

  useEffect(() => {
    setLoading(true);
    let dataToLoad: Sale[] = [];
    try {
      const storedSales = localStorage.getItem(LOCAL_STORAGE_SALES_KEY);
      if (storedSales) {
        const parsedSales = JSON.parse(storedSales);
        dataToLoad = Array.isArray(parsedSales) ? parsedSales : [];
        // console.log("SalesContext: Loaded data from localStorage", dataToLoad.length);
      } else {
        // Se não há nada no localStorage, use os dados iniciais de exemplo
        dataToLoad = Array.isArray(exampleSalesForSergio) ? exampleSalesForSergio : [];
        // console.log("SalesContext: No data in localStorage, using example data", dataToLoad.length);
        if (dataToLoad.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_SALES_KEY, JSON.stringify(dataToLoad));
          // console.log("SalesContext: Saved example data to localStorage");
        }
      }
    } catch (error) {
      console.error("SalesContext: Error during initial data load from localStorage. Falling back to example data.", error);
      localStorage.removeItem(LOCAL_STORAGE_SALES_KEY); // Limpa localStorage em caso de erro de parse
      dataToLoad = Array.isArray(exampleSalesForSergio) ? exampleSalesForSergio : []; // Usa os dados de exemplo como fallback
      if (dataToLoad.length > 0) {
        try {
          localStorage.setItem(LOCAL_STORAGE_SALES_KEY, JSON.stringify(dataToLoad));
          // console.log("SalesContext: Saved example data to localStorage after error.");
        } catch (saveError) {
          console.error("SalesContext: Failed to save example data to localStorage after error", saveError);
        }
      }
    } finally {
      setSales(dataToLoad.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
      // console.log("SalesContext: Initialization complete. Loading set to false. Total sales loaded:", dataToLoad.length);
    }
  }, []); // A dependência vazia [] garante que isso rode apenas uma vez na montagem.

  // Este useEffect persiste as alterações no estado 'sales' para o localStorage.
  // Ele só executa se 'loading' for false, para evitar salvar um estado inicial vazio
  // ou incompleto durante o carregamento inicial.
  useEffect(() => {
    if (!loading) {
      // console.log("SalesContext: Persisting sales to localStorage", sales.length);
      localStorage.setItem(LOCAL_STORAGE_SALES_KEY, JSON.stringify(sales));
    }
  }, [sales, loading]);

  const addSale = useCallback((saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: uuidv4(),
      createdAt: Date.now(),
    };
    setSales(prevSales => [...prevSales, newSale].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return newSale;
  }, []);

  const updateSale = useCallback((id: string, saleUpdateData: Partial<Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>>): Sale | undefined => {
    let updatedSale: Sale | undefined;
    setSales(prevSales =>
      prevSales.map(sale => {
        if (sale.id === id) {
          const currentSeller = sale.seller; 
          updatedSale = {
            ...sale,
            ...saleUpdateData,
            seller: saleUpdateData.seller || currentSeller,
            updatedAt: Date.now()
          };
          return updatedSale;
        }
        return sale;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    return updatedSale;
  }, []);

  const deleteSale = useCallback((id: string) => {
    setSales(prevSales => prevSales.filter(sale => sale.id !== id));
  }, []);

  const getSaleById = useCallback((id: string): Sale | undefined => {
    return sales.find(sale => sale.id === id);
  }, [sales]);

  const setSelectedSeller = useCallback((seller: Seller | typeof ALL_SELLERS_OPTION) => {
    setSelectedSellerState(seller);
  }, []);

  const setFilters = useCallback((newFilters: SalesFilters) => {
    setFiltersState(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  const filteredSales = useMemo(() => {
    return sales
      .filter(sale => {
        if (selectedSeller === ALL_SELLERS_OPTION) return true;
        return sale.seller === selectedSeller;
      })
      .filter(sale => {
        if (!filters.searchTerm) return true;
        const term = filters.searchTerm.toLowerCase();
        return (
          sale.company.toLowerCase().includes(term) ||
          sale.project.toLowerCase().includes(term) ||
          sale.os.toLowerCase().includes(term) ||
          sale.clientService.toLowerCase().includes(term)
        );
      })
      .filter(sale => {
        if (!filters.startDate) return true;
        const saleDate = new Date(sale.date);
        saleDate.setUTCHours(0,0,0,0);
        const filterStartDate = new Date(filters.startDate);
        filterStartDate.setUTCHours(0,0,0,0);
        return saleDate >= filterStartDate;
      })
      .filter(sale => {
        if (!filters.endDate) return true;
        const saleDate = new Date(sale.date);
        saleDate.setUTCHours(0,0,0,0); 
        const filterEndDate = new Date(filters.endDate);
        filterEndDate.setUTCHours(23,59,59,999); 
        return saleDate <= filterEndDate;
      });
  }, [sales, selectedSeller, filters]);

  return (
    <SalesContext.Provider
      value={{
        sales,
        filteredSales,
        selectedSeller,
        setSelectedSeller,
        addSale,
        updateSale,
        deleteSale,
        getSaleById,
        setFilters,
        filters,
        loading
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

    