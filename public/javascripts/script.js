
  function addToCart(proId){
    $.ajax({
      url:'/add-to-cart/'+proId,
      method:'get',
      success:(response)=>{
        if(response.status){
        let count=$('#cart-count').html()
        count=parseInt(count)+1
        $('#cart-count').html(count)
        }
      }
    })
  }

  function addToWishlist(proId){
    $.ajax({
      url:'/addToWishlist/'+proId,
      method:'get',
      success:(response)=>{
        location.reload()
      }
    })
  }
