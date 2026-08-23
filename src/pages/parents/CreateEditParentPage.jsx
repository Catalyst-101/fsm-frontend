import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';

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

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Loading parent data...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">
            {isEdit ? 'Edit Parent Record' : 'Create New Parent'}
          </h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Parent Details and Identification</p>
        </div>
        <Link to="/parents">
          <Button variant="secondary" className="px-4 py-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 flex items-start gap-2 rounded-r-lg">
          <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Full Name *"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mohammad Ali"
            required
          />

          <InputField
            label="CNIC (National ID) *"
            type="text"
            value={cnic}
            onChange={(e) => setCnic(e.target.value.replace(/\D/g, '').slice(0, 13))}
            placeholder="e.g. 3520212345671 (13 digits)"
            required
            maxLength={13}
            minLength={13}
            className="font-mono"
            icon="badge"
          />

          <InputField
            label="Phone Number *"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="e.g. 03369341134 (11 digits)"
            required
            maxLength={11}
            minLength={11}
            icon="phone"
          />

          <InputField
            label="Email Address (Optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. parent@example.com"
            icon="mail"
          />

          <InputField
            label="Occupation (Optional)"
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="e.g. Engineer"
            icon="work"
          />

          <div>
            <label className="block font-semibold text-xs tracking-wider text-[var(--color-text)] mb-2 uppercase">Address (Optional)</label>
            <div className="relative rounded-lg border border-gray-300 transition-all focus-within:border-[var(--color-secondary)] focus-within:border-2 bg-white">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Residential address..."
                className="block w-full p-3 border-none bg-transparent focus:ring-0 text-sm text-[var(--color-text)] rounded-lg placeholder-gray-400 outline-none resize-none"
              />
            </div>
          </div>

          {isEdit && (
            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                Parent Active Status
              </label>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 mt-6">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-3"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Parent Record' : 'Create Parent'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditParentPage;
