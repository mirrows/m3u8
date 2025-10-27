
import { defineStore } from 'pinia'

export const useNav = defineStore('nav', {
  state: () => ({
    header: false,
    menu: false,
  }),
  actions: {
    setHeader(show: boolean) {
      this.header = show
    },
    toggleHeader() {
      this.header = !this.header
    },
    setMenu(show: boolean) {
      this.menu = show
    },
    toggleMenu() {
      this.menu = !this.menu
    },
  }
})
