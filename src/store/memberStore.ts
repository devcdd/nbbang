import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Member} from '../types';

interface MemberStore {
  members: Member[];
  addMember: (member: Member) => void;
  removeMember: (member: Member) => void;
  setMembers: (members: Member[]) => void;
  loadMembers: () => Promise<void>;
  saveMembers: () => Promise<void>;
}

const STORAGE_KEY = '@members';

// 기본 멤버 데이터
const DEFAULT_MEMBERS: Member[] = [];

export const useMemberStore = create<MemberStore>((set, get) => ({
  members: DEFAULT_MEMBERS,

  addMember: member => {
    set(state => {
      const newMembers = [...state.members, member];
      return {members: newMembers};
    });
    // AsyncStorage 실패해도 메모리에는 저장
    get().saveMembers().catch(console.error);
  },

  removeMember: member => {
    set(state => {
      const newMembers = state.members.filter(m => m !== member);
      return {members: newMembers};
    });
    // AsyncStorage 실패해도 메모리에는 저장
    get().saveMembers().catch(console.error);
  },

  setMembers: members => {
    set({members});
    // AsyncStorage 실패해도 메모리에는 저장
    get().saveMembers().catch(console.error);
  },

  loadMembers: async () => {
    try {
      if (!AsyncStorage) {
        console.warn('AsyncStorage is not available');
        return;
      }

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedMembers = JSON.parse(stored);
        if (Array.isArray(parsedMembers)) {
          set({members: parsedMembers});
        } else {
          console.warn('Stored members is not an array, using default');
          set({members: DEFAULT_MEMBERS});
        }
      }
    } catch (e) {
      console.error('멤버 로드 실패:', e);
      // 에러 발생시 기본값 사용
      set({members: DEFAULT_MEMBERS});
    }
  },

  saveMembers: async () => {
    try {
      if (!AsyncStorage) {
        console.warn('AsyncStorage is not available');
        return;
      }

      const {members} = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('멤버 저장 실패:', e);
    }
  },
}));
