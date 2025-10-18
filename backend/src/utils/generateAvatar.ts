import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique anonymous author ID
 */
export const generateAnonymousId = (): string => {
  return `anon_${uuidv4()}`;
};

/**
 * List of animals for anonymous usernames
 */
const animals = [
  'Panda', 'Tiger', 'Lion', 'Bear', 'Wolf', 'Fox', 'Eagle', 'Hawk', 'Owl',
  'Dolphin', 'Whale', 'Shark', 'Penguin', 'Koala', 'Kangaroo', 'Leopard',
  'Cheetah', 'Jaguar', 'Panther', 'Dragon', 'Phoenix', 'Griffin', 'Unicorn',
  'Raccoon', 'Otter', 'Badger', 'Raven', 'Falcon', 'Lynx', 'Cobra'
];

/**
 * Generates a random anonymous username like "Anonymous Panda"
 */
export const generateAnonymousUsername = (): string => {
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `Anonymous ${animal}`;
};

/**
 * Generates a random avatar URL using DiceBear API
 * Uses different styles for variety
 */
export const generateAnonymousAvatar = (): string => {
  const styles = ['adventurer', 'avataaars', 'big-smile', 'bottts', 'fun-emoji', 'pixel-art'];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const seed = uuidv4();
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
};

/**
 * Generates a complete anonymous identity
 */
export const generateAnonymousIdentity = () => {
  return {
    anonymousAuthorId: generateAnonymousId(),
    anonymousUsername: generateAnonymousUsername(),
    anonymousAvatar: generateAnonymousAvatar(),
  };
};
