import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { PageHeader, SectionCard, InputField, Button, AlertBanner } from '../../components/ui';
import Loader from '../../components/Loader';
import useAuth from '../../hooks/useAuth';

const TransactionLimits = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        userId: '',
        maxDeposit: 100000,
        maxWithdrawal: 50000,
        maxTransfer: 25000
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveLimits = async (isGlobal = false) => {
        try {
            setSaving(true);
            const payload = {
                userId: isGlobal ? null : formData.userId,
                maxDeposit: Number(formData.maxDeposit),
                maxWithdrawal: Number(formData.maxWithdrawal),
                maxTransfer: Number(formData.maxTransfer),
                updatedBy: user.email
            };

            await adminApi.post('/api/admin/accounts/limits/set', payload);
            toast.success(isGlobal ? 'Global limits updated!' : `Limits updated for User #${formData.userId}`);
            
            if (!isGlobal) setFormData(prev => ({ ...prev, userId: '' }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update limits');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ paddingBottom: '40px', maxWidth: '800px' }}>
            <PageHeader 
                title="Transaction Limits" 
                icon="⚖️" 
                subtitle="Configure maximum allowable amounts for financial movements"
            />

            <AlertBanner 
                type="info" 
                message="Limits applied per user will override the global bank-wide defaults." 
                style={{ marginBottom: '24px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Global Limits */}
                <SectionCard title="🌐 Global Limits" subtitle="Applies to all users by default">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <InputField 
                            label="Max Deposit (₹)" 
                            name="maxDeposit"
                            type="number"
                            value={formData.maxDeposit}
                            onChange={handleInputChange}
                            placeholder="100000"
                        />
                        <InputField 
                            label="Max Withdrawal (₹)" 
                            name="maxWithdrawal"
                            type="number"
                            value={formData.maxWithdrawal}
                            onChange={handleInputChange}
                            placeholder="50000"
                        />
                        <InputField 
                            label="Max Transfer (₹)" 
                            name="maxTransfer"
                            type="number"
                            value={formData.maxTransfer}
                            onChange={handleInputChange}
                            placeholder="25000"
                        />
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={() => handleSaveLimits(true)}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Update Global Defaults'}
                        </Button>
                    </div>
                </SectionCard>

                {/* Per User Limits */}
                <SectionCard title="👤 Individual Limits" subtitle="Set specific limits for a single user">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <InputField 
                            label="Target User ID" 
                            name="userId"
                            type="text"
                            value={formData.userId}
                            onChange={handleInputChange}
                            placeholder="Enter User ID (e.g. 101)"
                            icon="🆔"
                        />
                        <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px', border: '1px dashed #D1D5DB' }}>
                            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>CUSTOM AMOUNTS</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <InputField 
                                    label="Custom Deposit" 
                                    name="maxDeposit"
                                    type="number"
                                    value={formData.maxDeposit}
                                    onChange={handleInputChange}
                                    style={{ marginBottom: 0 }}
                                />
                                <InputField 
                                    label="Custom Withdrawal" 
                                    name="maxWithdrawal"
                                    type="number"
                                    value={formData.maxWithdrawal}
                                    onChange={handleInputChange}
                                    style={{ marginBottom: 0 }}
                                />
                                <InputField 
                                    label="Custom Transfer" 
                                    name="maxTransfer"
                                    type="number"
                                    value={formData.maxTransfer}
                                    onChange={handleInputChange}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        </div>
                        <Button 
                            variant="success" 
                            fullWidth 
                            onClick={() => handleSaveLimits(false)}
                            disabled={saving || !formData.userId}
                        >
                            {saving ? 'Applying...' : 'Apply Per-User Limits'}
                        </Button>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default TransactionLimits;
