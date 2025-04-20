// En el componente CartItem, modifica para distinguir entre productos y repuestos:

const CartItem = ({ item, onRemove, onChangeQuantity }) => {
  const itemType = item.type === 'spare_part' ? 'Repuesto: ' : '';
  
  return (
    <Box display="flex" mb={2} p={1} borderRadius={1} bgcolor="background.paper">
      <Box width={60} height={60} mr={2} display="flex" alignItems="center" justifyContent="center">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
        ) : (
          <ShoppingBagIcon color="primary" fontSize="large" />
        )}
      </Box>
      <Box flex={1}>
        <Typography variant="body2" fontWeight="medium">
          {itemType}{item.name}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
          <Typography variant="body2" color="primary.main" fontWeight="bold">
            {Number(item.price).toFixed(2)}€
          </Typography>
          <Box display="flex" alignItems="center">
            {/* ...controles de cantidad, etc... */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};