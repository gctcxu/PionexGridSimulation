import Vue from 'vue';
import {
  Lazyload,
  Toast,
  Button,
  Loading,
  Dialog,
} from 'vant';

Toast.setDefaultOptions({ duration: 1500 });

Vue.use(Toast);
Vue.use(Lazyload);
Vue.use(Button);
Vue.use(Loading);
Vue.use(Dialog);