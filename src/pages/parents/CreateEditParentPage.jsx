import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const CreateEditParentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchParent = async () => {
        try {
          const res = await api.get(`/parents/${id}`);
          const p = res.data.data.parent;
          setName(p.name || '');
          setCnic(p.cnic || '');
          setPhone(p.phone || '');
          setEmail(p.email || '');
          setOccupation(p.occupation || '');
          setAddress(p.address || '');
          setIsActive(p.isActive !== undefined ? p.isActive : true);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch parent data.');
        } finally {
          setLoading(false);
        }
      };
      fetchParent();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = { name, cnic, phone, email, occupation, address, isActive };

    try {
      if (isEdit) {
        await api.put(`/parents/${id}`, payload);
      } else {
        await api.post('/parents', payload);
      }
      navigate('/parents');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save parent record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading parent data...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isEdit ? 'Edit Parent Record' : 'Create New Parent'}
          </h2>
          <p className="text-xs text-slate-400">Parent details and identification</p>
        </div>
        <Link to="/parents" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
          ← Back to Parents List
        </Link>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>}

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mohammad Ali"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">CNIC (National ID) *</label>
            <input
              type="text"
              value={cnic}
              onChange={(e) => setCnic(e.target.value.replace(/\D/g, '').slice(0, 13))}
              placeholder="e.g. 3520212345671 (13 digits)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
              required
              maxLength={13}
              minLength={13}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Phone Number *</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="e.g. 03369341134 (11 digits)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              required
              maxLength={11}
              minLength={11}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email Address (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. parent@example.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Occupation (Optional)</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Engineer"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Address (Optional)</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Residential address..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {isEdit && (
            <div>
              <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                Parent Active Status
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Parent Record' : 'Create Parent'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditParentPage;
