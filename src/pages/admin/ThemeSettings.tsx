
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define o tipo para as configurações de tema
type ThemeSettings = {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerBgColor: string;
  sidebarBgColor: string;
  textColor: string;
  fontFamily: string;
};

// Valores padrão
const defaultTheme: ThemeSettings = {
  siteName: 'Kanban Admin',
  primaryColor: '#3b82f6', // blue-500
  secondaryColor: '#6366f1', // indigo-500
  accentColor: '#8b5cf6', // purple-500
  headerBgColor: '#ffffff',
  sidebarBgColor: '#ffffff',
  textColor: '#111827', // gray-900
  fontFamily: 'Inter, sans-serif',
};

const ThemeSettings: React.FC = () => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = useState(false);
  
  // Buscar configurações salvas no localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Aplicar configurações ao carregar
    applyThemeSettings(savedSettings ? JSON.parse(savedSettings) : defaultTheme);
  }, []);
  
  // Aplicar configurações ao DOM
  const applyThemeSettings = (config: ThemeSettings) => {
    // Aplicar variáveis CSS personalizadas
    document.documentElement.style.setProperty('--primary', hexToHSL(config.primaryColor).h + ' ' + hexToHSL(config.primaryColor).s + '% ' + hexToHSL(config.primaryColor).l + '%');
    document.documentElement.style.setProperty('--secondary', hexToHSL(config.secondaryColor).h + ' ' + hexToHSL(config.secondaryColor).s + '% ' + hexToHSL(config.secondaryColor).l + '%');
    document.documentElement.style.setProperty('--accent', hexToHSL(config.accentColor).h + ' ' + hexToHSL(config.accentColor).s + '% ' + hexToHSL(config.accentColor).l + '%');
    
    // Atualizar o título do site
    document.title = config.siteName;
    
    // Aplicar fonte
    document.body.style.fontFamily = config.fontFamily;
  };
  
  // Converter hex para HSL (para usar nas variáveis CSS)
  const hexToHSL = (hex: string) => {
    // Remover # se presente
    hex = hex.replace('#', '');
    
    // Converter hex para RGB
    let r = parseInt(hex.substr(0, 2), 16) / 255;
    let g = parseInt(hex.substr(2, 2), 16) / 255;
    let b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Encontrar min e max
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      
      h *= 60;
    }
    
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };
  
  // Salvar configurações
  const saveSettings = () => {
    setIsLoading(true);
    
    try {
      // Salvar no localStorage
      localStorage.setItem('themeSettings', JSON.stringify(settings));
      
      // Aplicar configurações
      applyThemeSettings(settings);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de tema foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resetar para valores padrão
  const resetToDefault = () => {
    setSettings(defaultTheme);
    applyThemeSettings(defaultTheme);
    localStorage.setItem('themeSettings', JSON.stringify(defaultTheme));
    toast({
      title: "Configurações resetadas",
      description: "As configurações de tema foram resetadas para os valores padrão.",
    });
  };
  
  // Atualizar um campo específico
  const handleChange = (field: keyof ThemeSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações de Tema</h1>
        <p className="text-muted-foreground">
          Personalize a aparência do seu sistema.
        </p>
      </div>
      
      <Tabs defaultValue="geral" className="max-w-4xl">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="cores">Cores</TabsTrigger>
          <TabsTrigger value="tipografia">Tipografia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as informações básicas do seu sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Nome do Site</Label>
                <Input
                  id="site-name"
                  value={settings.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  placeholder="Nome do seu site"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cores" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Paleta de Cores</CardTitle>
              <CardDescription>
                Personalize as cores do seu sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Cor Primária</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Cor Secundária</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accent-color">Cor de Destaque</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="text-color">Cor do Texto</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tipografia" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipografia</CardTitle>
              <CardDescription>
                Escolha a fonte utilizada no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="font-family">Família de Fonte</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) => handleChange('fontFamily', value)}
                >
                  <SelectTrigger id="font-family">
                    <SelectValue placeholder="Selecione uma fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                    <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                    <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                    <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                    <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                    <SelectItem value="system-ui, sans-serif">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 border rounded-md mt-2">
                <p style={{ fontFamily: settings.fontFamily }}>
                  Exemplo de texto com a fonte selecionada.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex gap-4">
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Configurações"}
        </Button>
        <Button variant="outline" onClick={resetToDefault}>
          Restaurar Padrão
        </Button>
      </div>
    </div>
  );
};

export default ThemeSettings;
