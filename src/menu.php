<?php
header('Content-Type','application/pdf; charset=utf-8');

$json = file_get_contents("php://input");
$pages = json_decode($json)->pages;

error_reporting(-1);
require_once($_SERVER["DOCUMENT_ROOT"].'/tfpdf/tfpdf.php');

define("LOGO_POSITION", 130);
define("HEADER", "Restaurace U Trávníčka - Polední Menu");

class Menu extends tFPDF {

  function header() {
      $this->SetX(15);
      $this->_SetFont();
  //    $this->Image('logo.png', LOGO_POSITION, 10, -85);
      $this->Cell(0,10, HEADER);
      $this->Ln(13);
  }

  function Footer() {
      // Page number
      $this->SetY(-15);
      $this->SetFont('Arial','I',8);
      $this->Cell(0,10,$this->PageNo(),0,0,'C');
  }

  function _SetFont($fs=12, $red=false) {
    $this->SetFont('arial_uni','', $fs);
    $this->SetTextColor($red ? 255 : 0,0,0);
  }
}

$pdf = new Menu();
$pdf->AddFont('arial_uni','','arial_unicode.ttf',true);
$pdf->SetFont('arial_uni','',10);

for ($pageIndex=0; $pageIndex < count($pages); ++$pageIndex) {
  $page = $pages[$pageIndex];
  $pdf->AddPage();

  // Page title
  $pdf->SetX(15);
  $pdf->_SetFont(12);
  $pdf->Cell(0,0,$page->title,0,1);

  $sections = $page->sections;
  for ($sectionIndex=0; $sectionIndex < count($sections); ++$sectionIndex) {
    $section = $sections[$sectionIndex];
    $pdf->ln(count($sections) > 2 ? 5 : 15);
    // Section title
    $pdf->SetX(15);
    $pdf->_SetFont(12, true);
    $pdf->Cell(0,10,$section->title,0,1);
    
    $items=$section->items;
    for($i = 0; $i < count($items); ++$i) {

          $item = $items[$i];

          $spacing=6;
          // Before
          if($section->beforeAsServing) {
            $pdf->SetX(10);
            $pdf->_SetFont(6);
          } else {
            $pdf->_SetFont(9);
          }      
          $pdf->Cell(10,$spacing,$item->before,0,0, 'L');

          // Label
          $pdf->SetX(16);
          $pdf->_SetFont(11);
          $pdf->Cell(0,$spacing,$item->title,0,0, 'L');

          // Alergens
          $pdf->SetX(LOGO_POSITION + 45);
          $pdf->_SetFont(8);
          $pdf->SetFillColor(230, 230, 230);
          $pdf->Cell(8,$spacing,$item->alergens,0,0, 'C', TRUE);
         
          // Price
          $pdf->_SetFont(10);
          $pdf->SetFillColor(255,255,255);
          $pdf->SetX(LOGO_POSITION + 56);
          $pdf->Cell(5,$spacing,$item->price,0,0, 'C', TRUE);

          // Unit
          $pdf->SetX(LOGO_POSITION + 62);
          $pdf->Cell(5,$spacing,$item->unit,0,1);
    }
    $pdf->ln(count($sections) > 2 ? 5 : 15);
  }
}

$attachment_location = $_SERVER["DOCUMENT_ROOT"] . "/menu.pdf";
$pdf->Output($attachment_location, 'F');


if (!file_exists($attachment_location)) {
  die("Error: File not found.");
}

