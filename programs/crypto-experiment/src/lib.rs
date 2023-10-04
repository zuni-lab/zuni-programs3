extern crate rand;
extern crate ff;

#[cfg(test)]
mod tests {
  use babyjubjub_rs::{PointProjective, Point};
  use num_bigint::BigInt;
  use ff::{Field, PrimeField, to_hex};
  pub type Fr = poseidon_rs::Fr; // alias
  use num_traits::Num;

  #[test]
  fn test_point_addition1() {
    let p: Point = Point {
      x: Fr::from_str(
        "17777552123799933955779906779655732241715742912184938656739573121738514868268",
      )
      .unwrap(),
      y: Fr::from_str(
        "2626589144620713026669568689430873010625803728049924121243784502389097019475",
      )
      .unwrap(),
    };
    let q: Point = Point {
      x: Fr::from_str(
        "16540640123574156134436876038791482806971768689494387082833631921987005038935",
      )
      .unwrap(),
      y: Fr::from_str(
        "20819045374670962167435360035096875258406992893633759881276124905556507972311",
      )
      .unwrap(),
    };
    let res = p.projective().add(&q.projective()).affine();
    assert_eq!(
      res.x,
      Fr::from_str("7916061937171219682591368294088513039687205273691143098332585753343424131937")
        .unwrap()
    );
    assert_eq!(
      res.y,
      Fr::from_str("14035240266687799601661095864649209771790948434046947201833777492504781204499")
        .unwrap()
    );

    let decimal_str_from_prime_field_repr =
      BigInt::from_str_radix(to_hex(&res.x).as_str(), 16).unwrap().to_str_radix(10);
    let original_decimal_str =
      String::from("7916061937171219682591368294088513039687205273691143098332585753343424131937");
    assert_eq!(decimal_str_from_prime_field_repr, original_decimal_str);
  }

  #[test]
  fn test_point_addition2() {
    let p: PointProjective = PointProjective {
      x: Fr::from_str(
        "17777552123799933955779906779655732241715742912184938656739573121738514868268",
      )
      .unwrap(),
      y: Fr::from_str(
        "2626589144620713026669568689430873010625803728049924121243784502389097019475",
      )
      .unwrap(),
      z: Fr::one(),
    };
    let q: PointProjective = PointProjective {
      x: Fr::from_str(
        "17777552123799933955779906779655732241715742912184938656739573121738514868268",
      )
      .unwrap(),
      y: Fr::from_str(
        "2626589144620713026669568689430873010625803728049924121243784502389097019475",
      )
      .unwrap(),
      z: Fr::one(),
    };
    let res = p.add(&q).affine();
    assert_eq!(
      res.x,
      Fr::from_str("6890855772600357754907169075114257697580319025794532037257385534741338397365")
        .unwrap()
    );
    assert_eq!(
      res.y,
      Fr::from_str("4338620300185947561074059802482547481416142213883829469920100239455078257889")
        .unwrap()
    );

    let decimal_str_from_prime_field_repr =
      BigInt::from_str_radix(to_hex(&res.y).as_str(), 16).unwrap().to_str_radix(10);
    let original_decimal_str =
      String::from("4338620300185947561074059802482547481416142213883829469920100239455078257889");
    assert_eq!(decimal_str_from_prime_field_repr, original_decimal_str);
  }

  #[test]
  fn test_point_addition3() {
    let p: Point = Point { x: Fr::from_str("0").unwrap(), y: Fr::from_str("1").unwrap() };
    let q: Point = Point { x: Fr::from_str("0").unwrap(), y: Fr::from_str("1").unwrap() };
    let res = p.projective().add(&q.projective()).affine();
    assert_eq!(res.x, Fr::from_str("0").unwrap());
    assert_eq!(res.y, Fr::from_str("1").unwrap());

    let decimal_str_from_prime_field_repr =
      BigInt::from_str_radix(to_hex(&res.y).as_str(), 16).unwrap().to_str_radix(10);
    let original_decimal_str = String::from("1");
    assert_eq!(decimal_str_from_prime_field_repr, original_decimal_str);
  }
}
