"use client";

import { useState, useEffect } from "react";
import { classApi } from "@/lib/api";
import { useSchool } from "@/contexts/SchoolContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Class {
  id: number;
  name: string;
}

function AdminClasses() {
  const { school } = useSchool();
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classApi.getAll();
      setClasses(res.data);
    } catch (err) {
      console.error("Failed to load classes", err);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      setMessage("مھرباني ڪري ڪلاس جو نالو داخل ڪريو");
      return;
    }

    setLoading(true);
    try {
      await classApi.create({ name: newClassName.trim() });
      setMessage("ڪلاس ڪاميابي سان شامل ٿي وئي");
      setNewClassName("");
      fetchClasses();
    } catch (err: any) {
      setMessage("غلطي: " + (err.response?.data?.detail || "ڪو مسئلو ٿيو"));
    }
    setLoading(false);
  };

  const handleDeleteClass = async (id: number) => {
    if (!confirm("ڇا توهان پڪ سان هن ڪلاس کي ڊليٽ ڪرڻ چاهيو ٿا؟")) {
      return;
    }

    try {
      await classApi.delete(id);
      setMessage("ڪلاس ڪاميابي سان ڊليٽ ٿي وئي");
      fetchClasses();
    } catch (err: any) {
      setMessage("غلطي: " + (err.response?.data?.detail || "ڪو مسئلو ٿيو"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-10 px-4 md:px-8 lg:px-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-pink-800 text-white rounded-t-2xl shadow-lg p-7 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">ڪلاس مئنيجمينٽ</h1>
          <p className="text-2xl font-bold opacity-90">{school?.school_name || 'اسڪول'}</p>
          {school?.semis_code && (
            <p className="text-xl opacity-80 mt-1">SEMIS: {school.semis_code}</p>
          )}
        </div>

        {/* Add Class Form */}
        <div className="bg-white p-6 shadow-lg border border-purple-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-5">نئين ڪلاس شامل ڪريو</h2>

          <form onSubmit={handleAddClass} className="flex gap-3 mb-6">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="ڪلاس جو نالو (مثال: ڪلاس پھريون، ڪلاس ٻيون)"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-base md:text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition duration-300 text-base md:text-lg"
            >
              {loading ? "شامل ٿي رهيو آهي..." : "شامل ڪريو"}
            </button>
          </form>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-base md:text-lg ${
              message.includes("ڪامياب") ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Classes List */}
        <div className="bg-white p-6 rounded-b-2xl shadow-lg border border-purple-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-5">موجوده ڪلاسز ({classes.length})</h2>

          {classes.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-xl">ڪا به ڪلاس نه ملي</p>
              <p className="text-base mt-2">مھرباني ڪري پهرين ڪلاس شامل ڪريو</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{cls.name}</h3>
                    <p className="text-sm text-gray-600">ID: {cls.id}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 text-sm"
                  >
                    ڊليٽ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminClassesPage() {
  return (
    <ProtectedRoute>
      <AdminClasses />
    </ProtectedRoute>
  );
}
