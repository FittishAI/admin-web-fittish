'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';

export default function SettingsForm() {
  const [settings, setSettings] = useState({
    companyName: 'Fittish AI',
    supportEmail: 'support@fittish.ai',
    website: 'https://fittish.ai',
    contactPhone: '+1 234 567 890',
    address: '',
    description: '',
  });

  const handleChange = (field: string, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    // Add your save logic here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800">Company Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              value={settings.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={settings.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              value={settings.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Company Address</Label>
          <Textarea
            id="address"
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Company Description</Label>
          <Textarea
            id="description"
            value={settings.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
