#!/usr/bin/env bash
# shellcheck disable=SC2086
# from: https://github.com/huggingface/transformers/blob/master/examples/token-classification/README.md
# SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# echo SCRIPT_DIR
# ENV_DIR=$SCRIPT_DIR/venv/bin
# source $ENV_DIR/activate

data=$1
output_dir=$2
model=$3
mkdir -p $output_dir

# add named arguments from: https://brianchildress.co/named-parameters-in-bash/
while [[ $# -gt 0 ]]; do
   if [[ $1 == *"--"* ]]; then
        param="${1/--/}"
        declare ${param}="$2"
        # echo $1 $2 // Optional to see the parameter:value result
   fi
  shift
done

# create output tmp directories
TMP_DIR=$output_dir/tmp
mkdir -p $TMP_DIR
# dt=$(date +"%m-%d-%y_%H-%M")
# output_dir=$ANNOTATIONS_DIR/results_$dt
# mkdir -p $output_dir

# text to conll
python3 txt_to_conll.py -i $data -o $TMP_DIR/txt.conll
conll_file=$TMP_DIR/txt.conll

# preprocess the data
if [[ ! -f "$TMP_DIR/test.txt" ]]; then
  printf "Prepare dataset for NER prediction... "
  # Get relevant columns of CONLLish files
  COL_TOKEN="1"
  cut -f "$COL_TOKEN" "${conll_file}" > "$TMP_DIR/test.txt.tmp"

  # Preprocess relevant columns of CONLLish files for NER
  MAX_LENGTH=512
  python preprocess.py "$TMP_DIR/test.txt.tmp" $model $MAX_LENGTH > "$TMP_DIR/test.txt"
  rm $TMP_DIR/test.txt.tmp
  printf "Done\n"
fi

# Predict the labels
BATCH_SIZE=8
MAX_SEQ_LENGTH=512

printf "Predicting the labels... "

if  python3 run_ner.py \
  --data_dir "$TMP_DIR" \
  --labels "labels.txt" \
  --model_name_or_path $model \
  --overwrite_output_dir \
  --output_dir $TMP_DIR/model_output \
  --logging_dir $output_dir \
  --max_seq_length $MAX_SEQ_LENGTH \
  --per_device_train_batch_size $BATCH_SIZE \
  --do_predict &> $output_dir/inference.log; then
	python3 match_gs_with_predictions.py -c $conll_file  -i $TMP_DIR/model_output/predictions.txt -o $output_dir/output.conll
	python3 conll_to_brat.py -c $conll_file -i $output_dir/output.conll -b $data -o $TMP_DIR/brat_tmp
	python3 post_processing.py -i $TMP_DIR/brat_tmp -o $output_dir/brat -f annotations_with_time.txt
	printf "Done\n"
	printf "Removing temporal files... " 
	rm -r $TMP_DIR
	rm $output_dir/output.conll
	rm $output_dir/inference.log
	printf "Done\n"
else
	printf "Failed, more details can be found in %s/inference.log\n" $output_dir
fi



