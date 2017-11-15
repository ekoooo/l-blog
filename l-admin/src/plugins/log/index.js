
export default {
    install(Vue) {
        const log = function() {
            if(process.env.NODE_ENV === 'development') {
                console.log.apply(console, arguments);
            }
        };
        
        Vue.log = log;
        Vue.prototype.$log = log;
    }
}
