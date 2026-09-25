// Pestaña de entrada: mostrar/ocultar panel de información
document.getElementById('btnInfo').addEventListener('click', function(){
  document.getElementById('infoPanel').classList.add('show');
});
document.getElementById('btnCerrar').addEventListener('click', function(){
  document.getElementById('infoPanel').classList.remove('show');
});
// Cerrar al tocar fuera de la tarjeta
document.getElementById('infoPanel').addEventListener('click', function(e){
  if(e.target === this){ this.classList.remove('show'); }
});
