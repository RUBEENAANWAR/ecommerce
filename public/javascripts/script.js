
  addToCart(prodId)=>{
    $.ajax({
      url:'/add-to-cart/'+proId,
      method:'get',
      success:(response)=>{
        alert(response)
      }
    })
  }
