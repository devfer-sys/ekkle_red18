<?php
$dolar_bcb = (float) preg_match('/<td class="numero">([\d\.]+)<\/td>/', @file_get_contents("https://www.bcb.gob.bo/librerias/indicadores/otras/ultimo.php"), $m) ? (float)$m[1] : 0;

echo "El cambio del dólar es " . $dolar_bcb ." bs";
?>