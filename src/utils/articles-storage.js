// utils/articles-storage.js
"use client";

const LOCAL_KEY = "ARTICLES_STORE";

export function getArticles() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  } catch {
    return [];
  }
}
export function saveArticles(arr) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
}
