'use client';
import axios from 'axios';
import { useState } from 'react';
import  {toast } from 'sonner'
import { setCookie } from '@/lib/cookies';

export default function StepThree({ data, onChange, onBack, onNext }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [regstatus, setRegstatus] = useState(false);
  const url = "https://gidswap-server.onrender.com/api/auth/signup"
  const handleSubmit = async () => {
  try {
    setSubmitting(true);

    const res = await axios.post(url, {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });

    const msg = res.data.message;
    const token = res.data.token;
    // const user = res.data.user;
    console.log(token)
    toast.success(`${msg}`);
    if (msg) {
      onNext(token);
    } else {
      toast.error(res.data.message || 'Registration failed.');
    }

  } catch (err: any) {
    console.error('API error:', err);
    toast.error(`Something went wrong: ${err.response?.data?.message || 'Unknown error'}`);
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Create Password</h2>
      <input
        type="password"
        placeholder="Password"
        value={data.password}
        onChange={(e) => onChange({ password: e.target.value })}
        className="w-full mb-2 p-2 border rounded outline focus-visible:outline-blue-700/90"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting || !data.password}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Finish'}
        </button>
      </div>
    </div>
  );
}
