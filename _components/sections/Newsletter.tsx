import { Mail } from "lucide-react";
import React from "react";

export default function Newsletter() {
  return (
    <div className="space-y-3">
      <h4 className="text-blue-200 font-semibold text-sm">Stay Updated</h4>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-4 py-2 bg-blue-900/30 border border-blue-400/20 rounded-lg text-blue-100 placeholder-blue-300/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 backdrop-blur-sm"
        />
        <button
          title="send mail"
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/25"
        >
          <Mail className="size-4" />
        </button>
      </div>
    </div>
  );
}
