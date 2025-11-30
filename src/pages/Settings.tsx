import { useState } from 'react';
import { useBeancountStore } from '@/store/beancountStore';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Grid from '@cloudscape-design/components/grid';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';

export default function Settings() {
  const { currentFile } = useBeancountStore();
  const [settings, setSettings] = useState({
    defaultCurrency: 'USD',
    dateFormat: 'YYYY-MM-DD',
    fiscalYearStart: '01-01',
    language: 'en',
    theme: 'light',
  });

  const handleSave = () => {
    localStorage.setItem('beancount-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const breadcrumbs = [
    { text: 'Friday', href: '/' },
    { text: 'Settings', href: '/settings' },
  ];

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup items={breadcrumbs} />

      <Header
        variant="h1"
        description="Configure your Friday preferences"
        actions={
          <Button variant="primary" iconName="save" onClick={handleSave}>
            Save Settings
          </Button>
        }
      >
        Settings
      </Header>

      <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
        <Container variant="stacked" header={<Header variant="h2">Currency</Header>}>
          <Form>
            <FormField label="Default Currency">
              <Input
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.detail.value })}
                placeholder="USD"
              />
            </FormField>
          </Form>
        </Container>

        <Container variant="stacked" header={<Header variant="h2">Date & Time</Header>}>
          <Form>
            <SpaceBetween direction="vertical" size="l">
              <FormField label="Date Format">
                <Select
                  selectedOption={{ label: settings.dateFormat, value: settings.dateFormat }}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.detail.selectedOption.value || 'YYYY-MM-DD' })}
                  options={[
                    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
                    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
                    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
                    { label: 'DD.MM.YYYY', value: 'DD.MM.YYYY' },
                  ]}
                />
              </FormField>
              <FormField label="Fiscal Year Start">
                <Input
                  value={settings.fiscalYearStart}
                  onChange={(e) => setSettings({ ...settings, fiscalYearStart: e.detail.value })}
                  placeholder="01-01"
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Container>

        <Container variant="stacked" header={<Header variant="h2">Localization</Header>}>
          <Form>
            <FormField label="Language">
              <Select
                selectedOption={{ label: settings.language === 'en' ? 'English' : settings.language === 'es' ? 'Spanish' : settings.language === 'fr' ? 'French' : settings.language === 'de' ? 'German' : 'Chinese', value: settings.language }}
                onChange={(e) => setSettings({ ...settings, language: e.detail.selectedOption.value || 'en' })}
                options={[
                  { label: 'English', value: 'en' },
                  { label: 'Spanish', value: 'es' },
                  { label: 'French', value: 'fr' },
                  { label: 'German', value: 'de' },
                  { label: 'Chinese', value: 'zh' },
                ]}
              />
            </FormField>
          </Form>
        </Container>

        <Container variant="stacked" header={<Header variant="h2">Appearance</Header>}>
          <Form>
            <FormField label="Theme">
              <Select
                selectedOption={{ label: settings.theme === 'light' ? 'Light' : settings.theme === 'dark' ? 'Dark' : 'Auto', value: settings.theme }}
                onChange={(e) => setSettings({ ...settings, theme: e.detail.selectedOption.value || 'light' })}
                options={[
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                  { label: 'Auto', value: 'auto' },
                ]}
              />
            </FormField>
          </Form>
        </Container>
      </Grid>

      <Container variant="stacked" header={<Header variant="h2">File Information</Header>}>
        <KeyValuePairs
          items={[
            {
              label: 'Current File',
              value: currentFile || 'No file loaded',
            },
          ]}
        />
      </Container>
    </SpaceBetween>
  );
}
