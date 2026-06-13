export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/trainers/index',
    'pages/booking/index',
    'pages/mine/index',
    'pages/pet-detail/index',
    'pages/pet-add/index',
    'pages/trainer-detail/index',
    'pages/course-booking/index',
    'pages/course-detail/index',
    'pages/effect-upload/index',
    'pages/membership/index',
    'pages/dashboard/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF7A45',
    navigationBarTitleText: '宠物训导',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF8F5'
  },
  tabBar: {
    color: '#B2BEC3',
    selectedColor: '#FF7A45',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/trainers/index',
        text: '训导师'
      },
      {
        pagePath: 'pages/booking/index',
        text: '预约'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
