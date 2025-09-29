import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Settings, Shield, Bell, Lock, HelpCircle, ChevronRight } from 'lucide-react-native';

export type SettingsCardProps = {
  onNotifications?: () => void;
  onPrivacy?: () => void;
  onHelp?: () => void;
  onManageUsers?: () => void;
  isAdmin?: boolean;
};

export default function SettingsCard({ onNotifications, onPrivacy, onHelp, onManageUsers, isAdmin }: SettingsCardProps) {


  const menuItems = [
    {
      label: 'Gerenciar Usuários',
      icon: Shield,
      action: onManageUsers,
      adminOnly: true,
    },
    {
      label: 'Notificações',
      icon: Bell,
      action: onNotifications,
      adminOnly: false,
    },
    {
      label: 'Privacidade',
      icon: Lock,
      action: onPrivacy,
      adminOnly: false,
    },
    {
      label: 'Ajuda e Suporte',
      icon: HelpCircle,
      action: onHelp,
      adminOnly: false,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Settings color="#71717A" size={20} />
        <Text style={styles.headerText}>Configurações e Mais</Text>
      </View>
      <View style={styles.itemsContainer}>
        {menuItems.map((item, index) => {
    if (item.adminOnly && !isAdmin) {
            return null;
          }

          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.itemRow, index === menuItems.filter(i => !(i.adminOnly && !isAdmin)).length - 1 && styles.lastItem]} 
              onPress={item.action}
            >
              <View style={styles.itemLeft}>
                <item.icon color={item.adminOnly ? "#FFA800" : "#3F3F46"} size={22} />
                <Text style={[styles.itemText, item.adminOnly && styles.adminText]}>
                  {item.label}
                </Text>
              </View>
              <ChevronRight color="#A1A1AA" size={20} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 18,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
    color: '#18181B',
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    color: '#18181B',
    fontSize: 16,
    marginLeft: 12,
  },
  adminText: {
    color: '#FFA800',
    fontWeight: 'bold',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
});