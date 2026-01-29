import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import Spinner from '../../components/UI/Spinner';

const PRICING_OPTIONS = ['free', 'paid', 'freemium'];

const RequiredLabel = ({ children }) => (
  <>
    {children} <span className="text-red-500">*</span>
  </>
);

const ToolForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [models, setModels] = useState([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    logo: '',
    category: '',
    tags: [],
    models: [],
    pricing: 'free',
    metadata: { githubUrl: '', huggingFaceUrl: '', apiDocumentation: '' },
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, tagRes, modelRes] = await Promise.all([
          api.get('/categories'),
          api.get('/tags'),
          api.get('/models'),
        ]);
        setCategories(catRes.data.data?.items || []);
        setTags(tagRes.data.data?.items || []);
        setModels(modelRes.data.data?.items || []);
      } catch (err) {
        showToast(err.response?.data?.message || t('admin.error'), 'error');
      }
    };
    fetchOptions();
  }, [t, showToast]);

  useEffect(() => {
    if (!id) return;
    const fetchTool = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tools/${id}`);
        const tool = res.data.data.tool;
        setForm({
          name: tool.name || '',
          description: tool.description || '',
          website: tool.website || '',
          logo: tool.logo || '',
          category: tool.category?._id || tool.category || '',
          tags: Array.isArray(tool.tags) ? tool.tags.map((t) => t._id || t) : [],
          models: Array.isArray(tool.models) ? tool.models.map((m) => m._id || m) : [],
          pricing: tool.pricing || 'free',
          metadata: {
            githubUrl: tool.metadata?.githubUrl || '',
            huggingFaceUrl: tool.metadata?.huggingFaceUrl || '',
            apiDocumentation: tool.metadata?.apiDocumentation || '',
          },
        });
      } catch (err) {
        showToast(err.response?.data?.message || t('admin.error'), 'error');
        navigate('../', { relative: 'path' });
      } finally {
        setLoading(false);
      }
    };
    fetchTool();
  }, [id, navigate, t, showToast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMetadataChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }));
  };

  const handleMultiSelect = (name, optionId, checked) => {
    setForm((prev) => {
      const arr = [...(prev[name] || [])];
      if (checked) arr.push(optionId);
      else {
        const i = arr.indexOf(optionId);
        if (i !== -1) arr.splice(i, 1);
      }
      return { ...prev, [name]: arr };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.description?.trim() || !form.website?.trim() || !form.category) {
      showToast(t('admin.error'), 'error');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        website: form.website.trim(),
        logo: form.logo?.trim() || undefined,
        category: form.category,
        tags: form.tags,
        models: form.models,
        pricing: form.pricing,
        metadata: form.metadata,
      };
      if (isEdit) {
        await api.put(`/tools/${id}`, payload);
        showToast(t('admin.saved'), 'success');
        navigate('/admin/tools');
      } else {
        await api.post('/tools', payload);
        showToast(t('admin.saved'), 'success');
        navigate('/admin/tools');
      }
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEnrich = async () => {
    try {
      setEnriching(true);
      const res = await api.post(`/tools/${id}/enrich`);
      const newDescription = res.data?.data?.tool?.description;
      if (newDescription) {
        setForm((prev) => ({ ...prev, description: newDescription }));
      }
      showToast(t('admin.toolForm.enrichSuccess'), 'success');
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.error'), 'error');
    } finally {
      setEnriching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        {isEdit ? t('admin.toolForm.editTool') : t('admin.toolForm.newTool')}
      </h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label={<RequiredLabel>{t('admin.toolForm.name')}</RequiredLabel>}
            value={form.name}
            onChange={handleChange}
            name="name"
            required
            minLength={2}
            maxLength={100}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              <RequiredLabel>{t('admin.toolForm.description')}</RequiredLabel>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <Input
            id="website"
            label={<RequiredLabel>{t('admin.toolForm.website')}</RequiredLabel>}
            type="url"
            value={form.website}
            onChange={handleChange}
            name="website"
            required
          />
          <Input
            id="logo"
            label={t('admin.toolForm.logo')}
            type="url"
            value={form.logo}
            onChange={handleChange}
            name="logo"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              <RequiredLabel>{t('admin.toolForm.category')}</RequiredLabel>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">--</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('admin.toolForm.pricing')}
            </label>
            <select
              name="pricing"
              value={form.pricing}
              onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {PRICING_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {t(`filters.pricing${p.charAt(0).toUpperCase() + p.slice(1)}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('admin.toolForm.tags')}
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label key={tag._id} className="flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-sm">
                  <input
                    type="checkbox"
                    checked={form.tags.includes(tag._id)}
                    onChange={(e) => handleMultiSelect('tags', tag._id, e.target.checked)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('admin.toolForm.models')}
            </label>
            <div className="flex flex-wrap gap-2">
              {models.map((model) => (
                <label key={model._id} className="flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-sm">
                  <input
                    type="checkbox"
                    checked={form.models.includes(model._id)}
                    onChange={(e) => handleMultiSelect('models', model._id, e.target.checked)}
                  />
                  {model.name}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded border border-slate-200 p-3 dark:border-slate-700">
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t('admin.toolForm.metadata')}</p>
            <Input
              id="githubUrl"
              label={t('admin.toolForm.githubUrl')}
              type="url"
              value={form.metadata.githubUrl}
              onChange={(e) => handleMetadataChange('githubUrl', e.target.value)}
            />
            <Input
              id="huggingFaceUrl"
              label={t('admin.toolForm.huggingFaceUrl')}
              type="url"
              value={form.metadata.huggingFaceUrl}
              onChange={(e) => handleMetadataChange('huggingFaceUrl', e.target.value)}
            />
            <Input
              id="apiDocumentation"
              label={t('admin.toolForm.apiDocumentation')}
              type="url"
              value={form.metadata.apiDocumentation}
              onChange={(e) => handleMetadataChange('apiDocumentation', e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              {t('common.cancel')}
            </Button>
            {isEdit && (
              <Button type="button" variant="secondary" onClick={handleEnrich} disabled={enriching}>
                {enriching ? t('common.loading') : t('admin.toolForm.generateAiDescription')}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ToolForm;
