
import Mock from 'mockjs'

Mock.mock(/\/api\/goods/,'post', () => {
  return {
    code: 200,
    data: orderData
  }
})
