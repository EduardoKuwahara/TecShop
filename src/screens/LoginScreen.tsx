import React, { useState } from 'react';
import { Modal, ScrollView, Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, Lock, Eye, EyeOff } from 'lucide-react-native';

import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

export default function LoginScreen() {

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);


  const [showRegister, setShowRegister] = useState(false);
  const [nome, setNome] = useState('');
  const [curso, setCurso] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [contato, setContato] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [sala, setSala] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLogin = async (loginEmail = email, loginSenha = senha) => {
    if (!loginEmail || !loginSenha) {
      Alert.alert('Erro', 'Por favor, preencha e-mail e senha.');
      return;
    }
    setLoginLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      });
      const data = await response.json();
      if (response.ok) {
        await login({ user: data.user, token: data.token });
      } else {
        Alert.alert('Erro de Login', data.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!nome || !curso || !periodo || !contato || !sala || !regEmail || !regSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos do cadastro!');
      return;
    }
    setRegisterLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, curso, periodo, contato, sala, email: regEmail, senha: regSenha }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso!', 'Cadastro realizado! Fazendo login...');
        setShowRegister(false);
        await handleLogin(regEmail, regSenha);
      } else {
        Alert.alert('Erro', data.error || 'Erro ao cadastrar');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão com o servidor.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Tec<Text style={{ color: '#FFA800' }}>S</Text><Text style={{ color: '#22C55E' }}>hop</Text></Text>
      </View>
      <Text style={styles.title}>Acesse sua conta</Text>

      <Text style={styles.label}>E-mail</Text>
      <View style={styles.inputContainer}>
        <User size={22} color="#A3A3A3" style={styles.icon} />
        <TextInput style={styles.inputField} placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#A3A3A3" />
      </View>

      <Text style={styles.label}>Senha</Text>
      <View style={styles.inputContainer}>
        <Lock size={22} color="#A3A3A3" style={styles.icon} />
        <TextInput style={styles.inputField} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry={!showPassword} placeholderTextColor="#A3A3A3" />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff size={22} color="#A3A3A3" /> : <Eye size={22} color="#A3A3A3" />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.forgotContainer}><Text style={styles.forgotText}>Esqueci minha senha</Text></TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => handleLogin()} disabled={loginLoading}>
        {loginLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Não tem uma conta? </Text>
        <TouchableOpacity onPress={() => setShowRegister(true)}><Text style={styles.signupLink}>Cadastre-se</Text></TouchableOpacity>
      </View>

      {/* --- Modal de Cadastro --- */}
      <Modal visible={showRegister} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', width: '90%', maxHeight: '85%', borderRadius: 16, padding: 20 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16, alignSelf: 'center', color: '#18181B' }}>Crie sua Conta</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.modalInput} placeholder="Nome completo" value={nome} onChangeText={setNome} placeholderTextColor="#A3A3A3" />

              <Text style={styles.label}>Curso</Text>
              <TextInput style={styles.modalInput} placeholder="Ex: Análise e Des. de Sistemas" value={curso} onChangeText={setCurso} placeholderTextColor="#A3A3A3" />

              <Text style={styles.label}>Período</Text>
              <TextInput style={styles.modalInput} placeholder="Ex: Noturno" value={periodo} onChangeText={setPeriodo} placeholderTextColor="#A3A3A3" />

              <Text style={styles.label}>Contato</Text>
              <TextInput style={styles.modalInput} placeholder="Telefone ou WhatsApp" value={contato} onChangeText={setContato} keyboardType="phone-pad" placeholderTextColor="#A3A3A3" />

              <Text style={styles.label}>Sala</Text>
              <TextInput style={styles.modalInput} placeholder="Ex: 101, 202, etc." value={sala} onChangeText={setSala} placeholderTextColor="#A3A3A3" />

              <Text style={styles.label}>E-mail Institucional</Text>
              <TextInput style={styles.modalInput} placeholder="seu.nome@fatec.sp.gov.br" value={regEmail} onChangeText={setRegEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#A3A3A3" />

              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputContainer}>
                <Lock size={22} color="#A3A3A3" style={styles.icon} />
                <TextInput style={styles.inputField} placeholder="Senha" value={regSenha} onChangeText={setRegSenha} secureTextEntry={!regShowPassword} placeholderTextColor="#A3A3A3" />
                <TouchableOpacity onPress={() => setRegShowPassword(!regShowPassword)}>
                  {regShowPassword ? <EyeOff size={22} color="#A3A3A3" /> : <Eye size={22} color="#A3A3A3" />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={handleRegister} disabled={registerLoading}>
                {registerLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={{ alignSelf: 'center', marginTop: 12 }} onPress={() => setShowRegister(false)}>
                <Text style={{ color: '#FFA800', fontWeight: 'bold', fontSize: 16 }}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 12 },
  logoText: { fontSize: 32, fontWeight: 'bold', marginTop: 4, color: '#FFA800' },
  title: { fontSize: 24, fontWeight: 'bold', alignSelf: 'center', marginBottom: 24, color: '#18181B' },
  label: { fontSize: 16, fontWeight: '600', color: '#18181B', marginBottom: 6, marginTop: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 48 },
  icon: { marginRight: 8 },
  inputField: { flex: 1, fontSize: 16, color: '#18181B', height: '100%' },
  modalInput: { flex: 1, fontSize: 16, color: '#18181B', height: 48, backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, marginBottom: 12 },
  forgotContainer: { alignSelf: 'flex-end', marginVertical: 8 },
  forgotText: { color: '#FFA800', fontSize: 14, fontWeight: '500' },
  button: { backgroundColor: '#FFA800', borderRadius: 24, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 24 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { color: '#A3A3A3', fontSize: 14 },
  signupLink: { color: '#22C55E', fontWeight: 'bold', fontSize: 14, textDecorationLine: 'underline' },
});