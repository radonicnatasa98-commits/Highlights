import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useEntries } from '../store/entries';
import { useReminders } from '../store/reminders';
import { signOut } from '../store/session';
import { menu } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Glass } from './Glass';
import { Icon } from './Icon';
import { useDesignTop } from './Screen';

// Pulsante "menu-04" in alto a destra: apre un pannello con "Esci" ed "Elimina i miei dati".
export function MenuButton() {
  const top = useDesignTop();
  const { clear } = useEntries();
  const { clearAll } = useReminders();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const close = () => {
    setOpen(false);
    setConfirm(false);
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel="Menu" hitSlop={6}>
        <Glass radius={4} style={styles.button}>
          <Icon icon={menu} color={colors.navy} />
        </Glass>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Chiudi menu" />
        <View style={[styles.panelWrap, { top: top + 104 }]} pointerEvents="box-none">
          <Glass radius={20} fill="rgba(255,255,255,0.94)" frost style={styles.panel}>
            {confirm ? (
              <View style={styles.confirm}>
                <Text style={styles.confirmTitle}>Eliminare tutti i dati?</Text>
                <Text style={styles.confirmText}>
                  Post-it, Diari e promemoria salvati su questo telefono verranno cancellati. Non si può annullare.
                </Text>
                <View style={styles.confirmRow}>
                  <Pressable onPress={() => setConfirm(false)} style={styles.confirmButton}>
                    <Text style={styles.cancel}>Annulla</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      clear();
                      clearAll();
                      close();
                    }}
                    style={[styles.confirmButton, styles.danger]}
                  >
                    <Text style={styles.dangerText}>Elimina</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <Pressable
                  style={styles.item}
                  onPress={() => {
                    close();
                    signOut();
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.itemText}>Esci</Text>
                </Pressable>
                <View style={styles.separator} />
                <Pressable style={styles.item} onPress={() => setConfirm(true)} accessibilityRole="button">
                  <Text style={[styles.itemText, styles.itemDanger]}>Elimina i miei dati</Text>
                </Pressable>
              </>
            )}
          </Glass>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18,37,91,0.12)' },
  panelWrap: { position: 'absolute', right: 24, left: 24, alignItems: 'flex-end' },
  panel: { width: 240, paddingVertical: 6 },
  item: { paddingHorizontal: 18, paddingVertical: 12 },
  itemText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.navy },
  itemDanger: { color: '#d33a2c' },
  separator: { height: 1, marginHorizontal: 14, backgroundColor: 'rgba(18,37,91,0.08)' },
  confirm: { padding: 16, gap: 8 },
  confirmTitle: { fontFamily: fonts.heavy, fontSize: 15, lineHeight: 22, color: colors.navy },
  confirmText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: 'rgba(18,37,91,0.75)' },
  confirmRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  confirmButton: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.navy,
  },
  cancel: { fontFamily: fonts.button, fontSize: 13, color: colors.navy },
  danger: { backgroundColor: '#d33a2c', borderColor: '#d33a2c' },
  dangerText: { fontFamily: fonts.button, fontSize: 13, color: colors.white },
});
