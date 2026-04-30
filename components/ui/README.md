# UI Components - Gluestack Style

Sistema de componentes UI inspirado no Gluestack UI, implementado manualmente para React Native.

## 📦 Componentes Disponíveis

### 🎯 Button
Botão com múltiplas variantes e tamanhos.

```tsx
import { Button } from '../components/UI';

<Button
  variant="primary" // primary | secondary | outline | ghost
  size="md"         // sm | md | lg
  loading={false}
  disabled={false}
  onPress={() => console.log('pressed')}
>
  Clique aqui
</Button>
```

### 📝 Input
Campo de entrada com validação e labels.

```tsx
import { Input } from '../components/UI';

<Input
  label="E-mail"
  placeholder="Digite seu e-mail"
  value={email}
  onChangeText={setEmail}
  error={error}
  helperText="Digite um e-mail válido"
  keyboardType="email-address"
/>
```

### 🃏 Card
Container com múltiplas variantes visuais.

```tsx
import { Card } from '../components/UI';

<Card
  variant="elevated" // elevated | outlined | filled
  padding={16}
  margin={8}
>
  <Text>Conteúdo do card</Text>
</Card>
```

### 📦 VStack
Container vertical com espaçamento automático.

```tsx
import { VStack } from '../components/UI';

<VStack
  space={16}
  alignItems="center"
  justifyContent="flex-start"
>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</VStack>
```

### 📦 HStack
Container horizontal com espaçamento automático.

```tsx
import { HStack } from '../components/UI';

<HStack
  space={12}
  alignItems="center"
  justifyContent="space-between"
>
  <Text>Esquerda</Text>
  <Text>Centro</Text>
  <Text>Direita</Text>
</HStack>
```

## 🎨 Tema e Cores

O sistema usa uma paleta de cores consistente:

- **Primary**: Azul (#2196f3)
- **Secondary**: Rosa (#e91e63)
- **Background**: Cinza claro (#f8fafc)
- **Text**: Cinza escuro (#1e293b)
- **Error**: Vermelho (#ef4444)

## 📱 Exemplo de Uso

Veja o arquivo `app/teste-ui.tsx` para um exemplo completo de implementação.

## 🔧 Personalização

Todos os componentes aceitam props `style` para personalização adicional:

```tsx
<Button
  style={{
    backgroundColor: '#custom-color',
    borderRadius: 20,
  }}
>
  Botão Personalizado
</Button>
```

## 🚀 Benefícios

- ✅ **Consistência Visual**: Design system unificado
- ✅ **TypeScript**: Tipagem completa
- ✅ **Flexibilidade**: Múltiplas variantes
- ✅ **Performance**: Componentes otimizados
- ✅ **Manutenibilidade**: Código organizado

## 📋 Próximos Componentes

- [ ] Badge
- [ ] Avatar
- [ ] Modal
- [ ] Toast
- [ ] Spinner
- [ ] Switch
- [ ] Checkbox
- [ ] Radio

## 🛠️ Instalação

Os componentes estão disponíveis em `components/UI/`. Importe individualmente ou use o index:

```tsx
// Import individual
import { Button } from '../components/UI/Button';

// Import do index
import { Button, Input, Card } from '../components/UI';
```
