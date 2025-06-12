"use client";
import React from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7C3AED] via-[#10B981] to-[#1F2937] p-4">
      <div className="w-full max-w-md bg-white/90 dark:bg-[#1F2937]/90 rounded-2xl shadow-xl p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-[#7C3AED] mb-2">Garçons</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-4">Acesse sua conta</p>
        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            className="rounded-lg border border-gray-300 focus:border-[#7C3AED] px-4 py-2 outline-none bg-gray-50 dark:bg-[#111827] dark:text-white"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="rounded-lg border border-gray-300 focus:border-[#7C3AED] px-4 py-2 outline-none bg-gray-50 dark:bg-[#111827] dark:text-white"
            required
          />
          <div className="flex justify-between items-center text-sm">
            <a href="#" className="text-[#7C3AED] hover:underline">Esqueci minha senha</a>
            <a href="#" className="text-[#10B981] hover:underline">Entrar com PIN</a>
          </div>
          <button
            type="submit"
            className="mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-2 rounded-lg shadow transition-colors"
          >
            Entrar
          </button>
        </form>
        <div className="flex flex-col gap-2 mt-4">
          <button className="flex items-center justify-center gap-2 border border-[#10B981] text-[#10B981] rounded-lg py-2 hover:bg-[#10B981] hover:text-white transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M2 12a10 10 0 1 0 20 0A10 10 0 0 0 2 12Zm10-7a7 7 0 0 1 6.93 6H12V5Zm6.93 8A7 7 0 0 1 12 19a7 7 0 0 1-6.93-6h13.86Z" fill="currentColor"/></svg>
            Entrar com QR Code
          </button>
        </div>
      </div>
    </div>
  );
}